class Helper {
  /**
   * Generate a random numeric code
   * @param length - Length of the code (default: 6)
   * @returns Random numeric code as string
   */
  static generateRandomCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }
}
export default Helper;
