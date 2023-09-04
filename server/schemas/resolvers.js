const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // if user is authenticated
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("savedBooks");
        return userData;
      }
      // if user is not authenticated
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      // create token
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      // find user by email
      const user = await User.findOne({ email });
      // if no user found
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      // check if password is correct
      const correctPw = await user.isCorrectPassword(password);
      // if password is incorrect
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      // create token
      const token = signToken(user);
      return { token, user };
    },
    // save book to savedBooks array from User model
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true }
        ).populate("savedBooks");

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    // remove book from savedBooks by bookID
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        ).populate("savedBooks");

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
