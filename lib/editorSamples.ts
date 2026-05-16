export const DEFAULT_EDITOR_FILE = 'src/services/paymentService.ts'

export const DEFAULT_EDITOR_CONTENT = `import { validateAmount } from '../utils/validation'
import { chargeGateway } from '../gateways/stripe'

export interface PaymentPayload {
  amount: number
  currency: string
  accountId: string
}

export async function processPayment(payload: PaymentPayload) {
  if (!payload.accountId) {
    throw new Error('accountId is required')
  }

  validateAmount(payload.amount)

  // TODO: add retry + idempotency before prod
  const result = await chargeGateway(payload)

  return {
    status: 'success',
    transactionId: result.id,
  }
}
`

export const TEST_FILE_CONTENT = `import { processPayment } from './paymentService'

// FIXME: no tests yet — coach flagged this PR
`
