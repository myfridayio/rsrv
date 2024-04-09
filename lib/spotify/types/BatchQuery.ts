export default interface BatchQuery {
  type?: string,
  time_range?: string,
  after?: string,
  limit?: number,
  offset?: number,
}