<?php

namespace App\Services;

use App\Models\ContentReport;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Support\ImageSanitizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    public function updateProfile(User $user, array $data): User
    {
        if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
            // Replace previous avatar to avoid orphaned files.
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            // Strip EXIF/GPS metadata before persisting (data minimisation).
            $data['avatar'] = ImageSanitizer::storeSanitized($data['avatar'], 'avatars', 'public');
        }

        return $this->users->update($user, $data);
    }

    /**
     * Soft delete the account and detach relations. Heavy purge is deferred to a
     * queued job in later phases; here we revoke access immediately.
     */
    public function deleteAccount(User $user): void
    {
        DB::transaction(function () use ($user) {
            $user->roles()->detach();
            $this->users->delete($user); // soft delete
        });
    }

    /**
     * Permanently erase PII for a user whose 30-day grace window has elapsed
     * (DPDP right-to-erasure + Google Play account-deletion). The user ROW is
     * NOT physically deleted: payments.user_id cascades and tax invoices/
     * payments must be retained, so the row is instead anonymized. Billing
     * identity is snapshotted onto each retained payment first so invoices stay
     * accurate after the user is scrubbed.
     */
    public function purgeAccount(User $user): void
    {
        // Operate on the soft-deleted row (and its trashed relations).
        $user = User::withTrashed()->findOrFail($user->getKey());

        DB::transaction(function () use ($user) {
            // a. Snapshot billing identity onto retained (incl. trashed) payments.
            foreach ($user->payments()->withTrashed()->get() as $payment) {
                $meta = $payment->meta ?? [];
                if (! isset($meta['billing_name'])) {
                    $meta['billing_name'] = $user->name;
                    $meta['billing_email'] = $user->email;
                    $payment->meta = $meta;
                    $payment->saveQuietly();
                }
            }

            // b. Delete stored files (all on the 'public' disk) + c. hard-delete
            //    PII satellites. Cards cascade their children at the DB level
            //    (all card_id FKs are cascadeOnDelete), but we iterate first to
            //    purge files and to remove soft-deleted children explicitly.
            $disk = Storage::disk('public');

            // Avatar.
            if ($user->avatar) {
                $disk->delete($user->avatar);
            }

            foreach ($user->cards()->withTrashed()->get() as $card) {
                if ($card->profile_photo) {
                    $disk->delete($card->profile_photo);
                }

                // Portfolio media files (model uses SoftDeletes -> forceDelete).
                foreach ($card->portfolioItems()->withTrashed()->get() as $item) {
                    $disk->delete(array_filter([$item->media_path, $item->thumbnail_path]));
                    $item->forceDelete();
                }

                // SoftDeletes children -> forceDelete to remove rows entirely.
                $card->leads()->withTrashed()->forceDelete();
                $card->services()->withTrashed()->forceDelete();

                // Plain models -> delete().
                $card->socialLinks()->delete();
                $card->analyticsEvents()->delete();
                // content_reports.card_id is cascadeOnDelete; deleting explicitly
                // removes reporter PII rather than waiting on the DB cascade.
                ContentReport::where('card_id', $card->id)->delete();

                $card->forceDelete(); // Card uses SoftDeletes.
            }

            // User-owned PII satellites (none use SoftDeletes -> delete()).
            $user->notifications()->delete();
            $user->rewardTransactions()->delete();
            $user->rewardWallet()->delete();
            $user->referralsMade()->delete();
            $user->referredVia()->delete();
            $user->teamMemberships()->withTrashed()->forceDelete(); // TeamMember uses SoftDeletes.

            // Owned teams: delete their members, logo files, then the team.
            foreach ($user->team()->withTrashed()->get() as $team) {
                if ($team->logo) {
                    $disk->delete($team->logo);
                }
                $team->members()->withTrashed()->forceDelete();
                $team->forceDelete(); // Team uses SoftDeletes.
            }

            // Detach roles.
            $user->roles()->detach();

            // KEEP (entitlement/tax history tied to retained payments):
            //   payments, subscriptions, templatePurchases.

            // d. Anonymize the user row (keep it so payment FKs survive).
            $user->forceFill([
                'name'                => 'Deleted User',
                // status is a plain varchar(20) (active|suspended in schema); the
                // column accepts arbitrary strings so 'deleted' is valid.
                'status'              => 'deleted',
                'email'               => "deleted-{$user->id}@deleted.invalid",
                'phone'               => null,
                'password'            => Hash::make(Str::random(64)),
                'avatar'              => null,
                'last_login_ip'       => null,
                'last_login_at'       => null,
                'consent_accepted_at' => null,
                'referral_code'       => null,
                'referred_by'         => null,
                'default_card_id'     => null,
                'remember_token'      => null,
                'email_verified_at'   => null,
                'anonymized_at'       => now(),
            ])->saveQuietly(); // stays soft-deleted; bypass events/observers.
        });
    }
}
