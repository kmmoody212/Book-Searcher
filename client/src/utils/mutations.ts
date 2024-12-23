import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const ADD_USER = gql`
  mutation AddUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;

export const SAVE_BOOK = gql`
  mutation SaveBook(
    $bookId: ID!
    $authors: [String]!
    $description: String!
    $title: String!
    $image: String!
    $link: String
  ) {
    saveBook(
      bookId: $bookId
      authors: $authors
      description: $description
      title: $title
      image: $image
      link: $link
    ) {
      bookCount
      savedBooks {
        bookId
        title
      }
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation RemoveBook($bookId: ID!) {
    removeBook(bookId: $bookId) {
      username
      email
      savedBooks {
        authors
        description
        title
        image
        link
      }
      bookCount
    }
  }
`;
