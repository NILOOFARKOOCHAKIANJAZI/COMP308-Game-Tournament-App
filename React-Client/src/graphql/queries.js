import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      username
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_PLAYERS = gql`
  query GetPlayers {
    players {
      id
      ranking
      createdAt
      updatedAt
      user {
        id
        username
        email
        role
      }
      tournaments {
        id
        name
        game
        date
        status
      }
    }
  }
`;

export const GET_PLAYER_BY_ID = gql`
  query GetPlayerById($id: ID!) {
    player(id: $id) {
      id
      ranking
      createdAt
      updatedAt
      user {
        id
        username
        email
        role
      }
      tournaments {
        id
        name
        game
        date
        status
      }
    }
  }
`;

export const GET_TOURNAMENTS = gql`
  query GetTournaments {
    tournaments {
      id
      name
      game
      date
      status
      createdAt
      updatedAt
      players {
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
  }
`;

export const GET_TOURNAMENT_BY_ID = gql`
  query GetTournamentById($id: ID!) {
    tournament(id: $id) {
      id
      name
      game
      date
      status
      createdAt
      updatedAt
      players {
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
  }
`;

export const GET_UPCOMING_TOURNAMENTS = gql`
  query GetUpcomingTournaments {
    upcomingTournaments {
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

export const GET_MY_TOURNAMENT_HISTORY = gql`
  query GetMyTournamentHistory {
    myTournamentHistory {
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