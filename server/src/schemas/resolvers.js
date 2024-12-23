//boilerplate code
import User from "../models/User.js";
import { signToken } from "../services/auth.js";
const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            console.log("context.user", context.user);
            const user = await User.findById(context.user._id).populate("savedBooks");
            if (!user) {
                console.log("No user found with the provided ID");
                return context;
            }
            console.log("user from get me resolver before send to client", user);
            return user;
        },
    },
    Mutation: {
        addUser: async (_parent, args) => {
            try {
                if (!args.username || !args.email || !args.password) {
                    throw new Error("All fields are required");
                }
                const existingUser = await User.findOne({ email: args.email });
                if (existingUser) {
                    throw new Error("User already exists");
                }
                const submission = {
                    username: args.username,
                    email: args.email,
                    password: args.password,
                };
                const user = await User.create(submission);
                const token = signToken(user.username, user.email, user._id);
                return { token, user };
            }
            catch (err) {
                console.error(err);
                throw new Error("Error creating user");
            }
        },
        login: async (_parent, args) => {
            try {
                const email = args.email;
                const user = await User.findOne({ email });
                if (!user) {
                    throw new Error("Invalid email or password");
                }
                // compare the password with the stored hash
                const validPassword = await user.isCorrectPassword(args.password);
                if (!validPassword) {
                    throw new Error("Invalid email or password");
                }
                const token = signToken(user.username, user.email, user._id);
                return { token, user };
            }
            catch (err) {
                console.error(err);
                throw new Error("Error creating user");
            }
        },
        saveBook: async (_parent, args, context) => {
            try {
                const user = context.user;
                const { bookId, authors, description, title, image, link } = args;
                const newBook = { bookId, authors, description, title, image, link };
                const updatedUser = await User.findOneAndUpdate({ _id: user._id }, { $addToSet: { savedBooks: newBook } }, { new: true, runValidators: true });
                return { user: updatedUser };
            }
            catch (err) {
                console.error(err);
                throw new Error("Error creating user");
            }
        },
        removeBook: async (_parent, args, context) => {
            try {
                const user = context.user;
                const updatedUser = await User.findOneAndUpdate({ _id: user._id }, { $pull: { savedBooks: { bookId: args.bookId } } }, { new: true, runValidators: true });
                return updatedUser;
            }
            catch (err) {
                console.error(err);
                throw new Error("Error creating user");
            }
        },
    },
};
export default resolvers;
