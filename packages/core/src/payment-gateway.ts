export type PaymentChannel = 'CARD_TO_CARD' | 'GATEWAY';

export type ReceiptDraft = {
  workspaceId: string;
  planId: string;
  amountRial: bigint;
  referenceCode: string;
  payerCardLast4?: string;
  note?: string;
  submittedByUserId: string;
};

export type PreparedReceipt = ReceiptDraft & {
  method: PaymentChannel;
  status: 'PENDING';
};

export interface PaymentGateway {
  method: PaymentChannel;
  prepare(draft: ReceiptDraft): PreparedReceipt;
}

/** Active MVP path. Records a pending card-to-card receipt. No file upload. */
export const cardToCardGateway: PaymentGateway = {
  method: 'CARD_TO_CARD',
  prepare(draft) {
    return { ...draft, method: 'CARD_TO_CARD', status: 'PENDING' };
  },
};

/**
 * Future online gateways (Zarinpal / Zibal) implement PaymentGateway with method GATEWAY.
 * This MVP does not call any payment network.
 */
export const gatewayPlaceholders = ['zarinpal', 'zibal'] as const;
