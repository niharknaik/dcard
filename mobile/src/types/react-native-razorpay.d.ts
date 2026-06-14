declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    key: string;
    amount: number; // in the smallest currency unit (paise)
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    image?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {color?: string};
  }

  export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface RazorpayError {
    code: number;
    description: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}
