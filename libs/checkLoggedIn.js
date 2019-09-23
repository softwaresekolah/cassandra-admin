import gql from "graphql-tag";

const QUERY = gql`
  query currentUser {
    currentUser {
      _id
      username
      Role {
        _id
        name
        privileges
      }
      status
    }
  }
`;

export default apolloClient =>
  apolloClient
    .query({
      query: QUERY
    })
    .then(({ data }) => {
      return { loggedInUser: data };
    })
    .catch(() => {
      // Fail gracefully
      return { loggedInUser: {} };
    });
