export default interface Scores {
  totalAssets: number
  netAssets: number
  debt: number
  income: number
  debtPaymentFrequency: number
  debtToIncomeRatio: number
  repaymentLikelihood: number
}

export interface ScoringResponse {
  scores: Scores
  address: string
  imageUri: string
  exploreUri: string
}