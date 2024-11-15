export const sixToken = () => {
    const token = Math.floor(100000 + Math.random() * 900000);
    if (token.length < 6) {
        sixToken();
    }
    return token;
};
