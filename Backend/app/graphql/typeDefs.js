const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String
    updatedAt: String
  }

  type Player {
    id: ID!
    user: User!
    ranking: Int!
    tournaments: [Tournament!]!
    createdAt: String
    updatedAt: String
  }

  type Tournament {
    id: ID!
    name: String!
    game: String!
    date: String!
    players: [Player!]!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    message: String!
    user: User
    token: String
  }

  type MessageResponse {
    message: String!
  }

  type Query {
    me: User

    users: [User!]!
    user(id: ID!): User

    players: [Player!]!
    player(id: ID!): Player

    tournaments: [Tournament!]!
    tournament(id: ID!): Tournament

    upcomingTournaments: [Tournament!]!
    myTournamentHistory: [Tournament!]!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      role: String
      adminSecretKey: String
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    logout: MessageResponse!

    createUser(
      username: String!
      email: String!
      password: String!
      role: String!
    ): User!

    updateUser(
      id: ID!
      username: String
      email: String
      password: String
      role: String
    ): User!

    deleteUser(id: ID!): MessageResponse!

    createPlayer(
      userId: ID!
      ranking: Int
    ): Player!

    updatePlayerRanking(
      playerId: ID!
      ranking: Int!
    ): Player!

    deletePlayer(id: ID!): MessageResponse!

    createTournament(
      name: String!
      game: String!
      date: String!
      status: String
    ): Tournament!

    updateTournament(
      id: ID!
      name: String
      game: String
      date: String
      status: String
    ): Tournament!

    deleteTournament(id: ID!): MessageResponse!

    assignPlayerToTournament(
      playerId: ID!
      tournamentId: ID!
    ): Tournament!

    joinTournament(
      tournamentId: ID!
    ): Tournament!
  }
`;

module.exports = typeDefs;