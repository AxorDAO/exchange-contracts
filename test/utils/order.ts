import { Order, SignedOrder, SigningMethod } from "../../tasks/lib/types";
import { Orders } from "../../tasks/utils/Orders";

export async function getSignedOrder(orderUtil: Orders, order: Order, signingMethod: SigningMethod): Promise<SignedOrder> {
  const typedSignature = await orderUtil.signOrder(order, signingMethod);
  return {
    ...order,
    typedSignature,
  };
}
