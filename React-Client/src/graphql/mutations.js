import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation RegisterUser(
    $username: String!
    $email: String!
    $password: String!
    $role: String
    $adminSecretKey: String
  ) {
    register(
      username: $username
      email: $email
      password: $password
      role: $role
      adminSecretKey: $adminSecretKey
    ) {
      message
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      message
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation LogoutUser {
    logout {
      message
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $role: String!
  ) {
    createUser(
      username: $username
      email: $email
      password: $password
      role: $role
    ) {
      id
      username
      email
      role
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser(
    $id: ID!
    $username: String
    $email: String
    $password: String
    $role: String
  ) {
    updateUser(
      id: $id
      username: $username
      email: $email
      password: $password
      role: $role
    ) {
      id
      username
      email
      role
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      message
    }
  }
`;

export const CREATE_PLAYER_MUTATION = gql`
  mutation CreatePlayer($userId: ID!, $ranking: Int) {
    createPlayer(userId: $userId, ranking: $ranking) {
      id
      ranking
      user {
        id
        username
        email
        role
      }
    }
  }
`;

export const UPDATE_PLAYER_RANKING_MUTATION = gql`
  mutation UpdatePlayerRanking($playerId: ID!, $ranking: Int!) {
    updatePlayerRanking(playerId: $playerId, ranking: $ranking) {
      id
      ranking
      user {
        id
        username
      }
      tournaments {
        id
        name
      }
    }
  }
`;

export const DELETE_PLAYER_MUTATION = gql`
  mutation DeletePlayer($id: ID!) {
    deletePlayer(id: $id) {
      message
    }
  }
`;

export const CREATE_TOURNAMENT_MUTATION = gql`
  mutation CreateTournament(
    $name: String!
    $game: String!
    $date: String!
    $status: String
  ) {
    createTournament(
      name: $name
      game: $game
      date: $date
      status: $status
    ) {
      id
      name
      game
      date
      status
    }
  }
`;

export const UPDATE_TOURNAMENT_MUTATION = gql`
  mutation UpdateTournament(
    $id: ID!
    $name: String
    $game: String
    $date: String
    $status: String
  ) {
    updateTournament(
      id: $id
      name: $name
      game: $game
      date: $date
      status: $status
    ) {
      id
      name
      game
      date
      status
      players {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

export const DELETE_TOURNAMENT_MUTATION = gql`
  mutation DeleteTournament($id: ID!) {
    deleteTournament(id: $id) {
      message
    }
  }
`;

export const ASSIGN_PLAYER_TO_TOURNAMENT_MUTATION = gql`
  mutation AssignPlayerToTournament($playerId: ID!, $tournamentId: ID!) {
    assignPlayerToTournament(playerId: $playerId, tournamentId: $tournamentId) {
      id
      name
      game
      date
      status
      players {
        id
        ranking
        user {
          id
          username
        }
      }
    }
  }
`;

export const JOIN_TOURNAMENT_MUTATION = gql`
  mutation JoinTournament($tournamentId: ID!) {
    joinTournament(tournamentId: $tournamentId) {
      id
      name
      game
      date
      status
      players {
        id
        ranking
        user {
          id
          username
        }
      }
    }
  }
`;