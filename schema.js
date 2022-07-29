const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const bcrypt = require("bcryptjs");

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userid: { type: GraphQLID },

    user: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.userid);
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve(parent, args) {
        return Comment.find({ postid: parent.id });
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },

    posts: {
      type: new GraphQLList(PostType),
      resolve(parent, args) {
        return Post.find({ userid: parent.id });
      },
    },
  }),
});

const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    userid: { type: GraphQLID },
    postid: { type: GraphQLID },

    post: {
      type: PostType,
      resolve(parent, args) {
        return Post.findById(parent.postid);
      },
    },
    user: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.userid);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Post.findById(args.id);
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return User.findById(args.id);
      },
    },
    comment: {
      type: CommentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Comment.findById(args.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve(parent, args) {
        return Post.find();
      },
    },

    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find();
      },
    },
    comments: {
      type: new GraphQLList(CommentType),
      resolve(parent, args) {
        return Comment.find();
      },
    },
  },
});

// mutation
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(args.password, salt);
        let user = User.create({
          name: args.name,
          email: args.email,
          password: hashPassword,
        });
        return user;
      },
    },
    loginUser: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        let user = User.findOne(args.email);
        if (user && (await bcrypt.compare(args.password, user.password))) {
          return user;
        }
      },
    },
    addPost: {
      type: PostType,
      args: {
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        userid: { type: GraphQLID },
      },
      resolve(parent, args) {
        let post = Post.create({
          title: args.title,
          content: args.content,
          userid: args.userid,
        });
        return post;
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args) {
        let user = User.findByIdAndUpdate(
          args.id,
          {
            name: args.name,
            email: args.email,
            password: args.password,
          },
          {
            new: true,
            runValidators: true,
          }
        );
        return user;
      },
    },
    editPost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        userid: { type: GraphQLID },
      },
      resolve(parent, args) {
        let post = Post.findByIdAndUpdate(
          args.id,
          {
            title: args.title,
            content: args.content,
          },
          {
            new: true,
            runValidators: true,
          }
        );
        return post;
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        let user = User.findByIdAndDelete(args.id);
        return user;
      },
    },
    deletePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        let post = Post.findByIdAndDelete(args.id);
        return post;
      },
    },
    addComment: {
      type: CommentType,
      args: {
        content: { type: GraphQLString },
        userid: { type: GraphQLID },
        postid: { type: GraphQLID },
      },
      resolve(parent, args) {
        let comment = Comment.create({
          content: args.content,
          userid: args.userid,
          postid: args.postid,
        });
        return comment;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
