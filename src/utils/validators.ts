// Verify a text string: allowing alphanumerical characters only (a-z, A-Z and 0-9)
export function isAlphanumeric(input: string) {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(input);
}