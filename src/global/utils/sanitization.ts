class Sanitization {
    User(user: any) {
        return {
            _id: user._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            active: user?.active,
            hasPassword: user?.hasPassword,
            googleId: user?.googleId,
            image: user?.image,
        };
    };
}

const sanitization = new Sanitization();
export default sanitization;