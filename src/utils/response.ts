type User = {
    _id: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    is_validated: boolean;
    auth_id: string;
    created_at?: Date;
};

export function formatUser(user: User) {
    return {
        type: "client",
        id: user._id,
        attributes: {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            birth_date: user.birth_date,
            is_validated: user.is_validated.toString(),
            auth_id: user.auth_id,
            created_at: user.created_at ? user.created_at.toISOString() : undefined
        }
    };
}

export function formatUsers(users: User[]) {
    return users.map(formatUser);
}
