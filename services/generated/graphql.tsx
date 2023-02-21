import { useQuery, UseQueryOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(endpoint: string, requestInit: RequestInit, query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...requestInit,
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type HistoryEvent = {
  __typename?: 'HistoryEvent';
  amount?: Maybe<Scalars['BigInt']>;
  createdBlock: Scalars['BigInt'];
  createdTimestamp: Scalars['BigInt'];
  eventType: Scalars['String'];
  id: Scalars['ID'];
  oldStream?: Maybe<Stream>;
  stream?: Maybe<Stream>;
  token: Token;
  txHash: Scalars['Bytes'];
  users: Array<User>;
};


export type HistoryEventUsersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<User_Filter>;
};

export type HistoryEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<HistoryEvent_Filter>>>;
  createdBlock?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlock_lt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_lte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventType?: InputMaybe<Scalars['String']>;
  eventType_contains?: InputMaybe<Scalars['String']>;
  eventType_contains_nocase?: InputMaybe<Scalars['String']>;
  eventType_ends_with?: InputMaybe<Scalars['String']>;
  eventType_ends_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_gt?: InputMaybe<Scalars['String']>;
  eventType_gte?: InputMaybe<Scalars['String']>;
  eventType_in?: InputMaybe<Array<Scalars['String']>>;
  eventType_lt?: InputMaybe<Scalars['String']>;
  eventType_lte?: InputMaybe<Scalars['String']>;
  eventType_not?: InputMaybe<Scalars['String']>;
  eventType_not_contains?: InputMaybe<Scalars['String']>;
  eventType_not_contains_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_ends_with?: InputMaybe<Scalars['String']>;
  eventType_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_not_in?: InputMaybe<Array<Scalars['String']>>;
  eventType_not_starts_with?: InputMaybe<Scalars['String']>;
  eventType_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  eventType_starts_with?: InputMaybe<Scalars['String']>;
  eventType_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  oldStream?: InputMaybe<Scalars['String']>;
  oldStream_?: InputMaybe<Stream_Filter>;
  oldStream_contains?: InputMaybe<Scalars['String']>;
  oldStream_contains_nocase?: InputMaybe<Scalars['String']>;
  oldStream_ends_with?: InputMaybe<Scalars['String']>;
  oldStream_ends_with_nocase?: InputMaybe<Scalars['String']>;
  oldStream_gt?: InputMaybe<Scalars['String']>;
  oldStream_gte?: InputMaybe<Scalars['String']>;
  oldStream_in?: InputMaybe<Array<Scalars['String']>>;
  oldStream_lt?: InputMaybe<Scalars['String']>;
  oldStream_lte?: InputMaybe<Scalars['String']>;
  oldStream_not?: InputMaybe<Scalars['String']>;
  oldStream_not_contains?: InputMaybe<Scalars['String']>;
  oldStream_not_contains_nocase?: InputMaybe<Scalars['String']>;
  oldStream_not_ends_with?: InputMaybe<Scalars['String']>;
  oldStream_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  oldStream_not_in?: InputMaybe<Array<Scalars['String']>>;
  oldStream_not_starts_with?: InputMaybe<Scalars['String']>;
  oldStream_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  oldStream_starts_with?: InputMaybe<Scalars['String']>;
  oldStream_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<HistoryEvent_Filter>>>;
  stream?: InputMaybe<Scalars['String']>;
  stream_?: InputMaybe<Stream_Filter>;
  stream_contains?: InputMaybe<Scalars['String']>;
  stream_contains_nocase?: InputMaybe<Scalars['String']>;
  stream_ends_with?: InputMaybe<Scalars['String']>;
  stream_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stream_gt?: InputMaybe<Scalars['String']>;
  stream_gte?: InputMaybe<Scalars['String']>;
  stream_in?: InputMaybe<Array<Scalars['String']>>;
  stream_lt?: InputMaybe<Scalars['String']>;
  stream_lte?: InputMaybe<Scalars['String']>;
  stream_not?: InputMaybe<Scalars['String']>;
  stream_not_contains?: InputMaybe<Scalars['String']>;
  stream_not_contains_nocase?: InputMaybe<Scalars['String']>;
  stream_not_ends_with?: InputMaybe<Scalars['String']>;
  stream_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stream_not_in?: InputMaybe<Array<Scalars['String']>>;
  stream_not_starts_with?: InputMaybe<Scalars['String']>;
  stream_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stream_starts_with?: InputMaybe<Scalars['String']>;
  stream_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  txHash?: InputMaybe<Scalars['Bytes']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']>;
  txHash_not?: InputMaybe<Scalars['Bytes']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  users?: InputMaybe<Array<Scalars['String']>>;
  users_?: InputMaybe<User_Filter>;
  users_contains?: InputMaybe<Array<Scalars['String']>>;
  users_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  users_not?: InputMaybe<Array<Scalars['String']>>;
  users_not_contains?: InputMaybe<Array<Scalars['String']>>;
  users_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
};

export enum HistoryEvent_OrderBy {
  Amount = 'amount',
  CreatedBlock = 'createdBlock',
  CreatedTimestamp = 'createdTimestamp',
  EventType = 'eventType',
  Id = 'id',
  OldStream = 'oldStream',
  OldStreamActive = 'oldStream__active',
  OldStreamAmountPerSec = 'oldStream__amountPerSec',
  OldStreamCreatedBlock = 'oldStream__createdBlock',
  OldStreamCreatedTimestamp = 'oldStream__createdTimestamp',
  OldStreamId = 'oldStream__id',
  OldStreamLastPaused = 'oldStream__lastPaused',
  OldStreamPaused = 'oldStream__paused',
  OldStreamPausedAmount = 'oldStream__pausedAmount',
  OldStreamReason = 'oldStream__reason',
  OldStreamStreamId = 'oldStream__streamId',
  Stream = 'stream',
  StreamActive = 'stream__active',
  StreamAmountPerSec = 'stream__amountPerSec',
  StreamCreatedBlock = 'stream__createdBlock',
  StreamCreatedTimestamp = 'stream__createdTimestamp',
  StreamId = 'stream__id',
  StreamLastPaused = 'stream__lastPaused',
  StreamPaused = 'stream__paused',
  StreamPausedAmount = 'stream__pausedAmount',
  StreamReason = 'stream__reason',
  StreamStreamId = 'stream__streamId',
  Token = 'token',
  TokenAddress = 'token__address',
  TokenCreatedBlock = 'token__createdBlock',
  TokenCreatedTimestamp = 'token__createdTimestamp',
  TokenDecimals = 'token__decimals',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenSymbol = 'token__symbol',
  TxHash = 'txHash',
  Users = 'users'
}

export type LlamaPayContract = {
  __typename?: 'LlamaPayContract';
  address: Scalars['Bytes'];
  createdBlock: Scalars['BigInt'];
  createdTimestamp: Scalars['BigInt'];
  factory: LlamaPayFactory;
  id: Scalars['ID'];
  streams: Array<Stream>;
  token: Token;
};


export type LlamaPayContractStreamsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Stream_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Stream_Filter>;
};

export type LlamaPayContract_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<LlamaPayContract_Filter>>>;
  createdBlock?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlock_lt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_lte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  factory?: InputMaybe<Scalars['String']>;
  factory_?: InputMaybe<LlamaPayFactory_Filter>;
  factory_contains?: InputMaybe<Scalars['String']>;
  factory_contains_nocase?: InputMaybe<Scalars['String']>;
  factory_ends_with?: InputMaybe<Scalars['String']>;
  factory_ends_with_nocase?: InputMaybe<Scalars['String']>;
  factory_gt?: InputMaybe<Scalars['String']>;
  factory_gte?: InputMaybe<Scalars['String']>;
  factory_in?: InputMaybe<Array<Scalars['String']>>;
  factory_lt?: InputMaybe<Scalars['String']>;
  factory_lte?: InputMaybe<Scalars['String']>;
  factory_not?: InputMaybe<Scalars['String']>;
  factory_not_contains?: InputMaybe<Scalars['String']>;
  factory_not_contains_nocase?: InputMaybe<Scalars['String']>;
  factory_not_ends_with?: InputMaybe<Scalars['String']>;
  factory_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  factory_not_in?: InputMaybe<Array<Scalars['String']>>;
  factory_not_starts_with?: InputMaybe<Scalars['String']>;
  factory_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  factory_starts_with?: InputMaybe<Scalars['String']>;
  factory_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<LlamaPayContract_Filter>>>;
  streams_?: InputMaybe<Stream_Filter>;
  token?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum LlamaPayContract_OrderBy {
  Address = 'address',
  CreatedBlock = 'createdBlock',
  CreatedTimestamp = 'createdTimestamp',
  Factory = 'factory',
  FactoryAddress = 'factory__address',
  FactoryCount = 'factory__count',
  FactoryCreatedBlock = 'factory__createdBlock',
  FactoryCreatedTimestamp = 'factory__createdTimestamp',
  FactoryId = 'factory__id',
  Id = 'id',
  Streams = 'streams',
  Token = 'token',
  TokenAddress = 'token__address',
  TokenCreatedBlock = 'token__createdBlock',
  TokenCreatedTimestamp = 'token__createdTimestamp',
  TokenDecimals = 'token__decimals',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenSymbol = 'token__symbol'
}

export type LlamaPayFactory = {
  __typename?: 'LlamaPayFactory';
  address: Scalars['Bytes'];
  contracts: Array<LlamaPayContract>;
  count: Scalars['Int'];
  createdBlock: Scalars['BigInt'];
  createdTimestamp: Scalars['BigInt'];
  id: Scalars['ID'];
};


export type LlamaPayFactoryContractsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LlamaPayContract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LlamaPayContract_Filter>;
};

export type LlamaPayFactory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<LlamaPayFactory_Filter>>>;
  contracts_?: InputMaybe<LlamaPayContract_Filter>;
  count?: InputMaybe<Scalars['Int']>;
  count_gt?: InputMaybe<Scalars['Int']>;
  count_gte?: InputMaybe<Scalars['Int']>;
  count_in?: InputMaybe<Array<Scalars['Int']>>;
  count_lt?: InputMaybe<Scalars['Int']>;
  count_lte?: InputMaybe<Scalars['Int']>;
  count_not?: InputMaybe<Scalars['Int']>;
  count_not_in?: InputMaybe<Array<Scalars['Int']>>;
  createdBlock?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlock_lt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_lte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<LlamaPayFactory_Filter>>>;
};

export enum LlamaPayFactory_OrderBy {
  Address = 'address',
  Contracts = 'contracts',
  Count = 'count',
  CreatedBlock = 'createdBlock',
  CreatedTimestamp = 'createdTimestamp',
  Id = 'id'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  historyEvent?: Maybe<HistoryEvent>;
  historyEvents: Array<HistoryEvent>;
  llamaPayContract?: Maybe<LlamaPayContract>;
  llamaPayContracts: Array<LlamaPayContract>;
  llamaPayFactories: Array<LlamaPayFactory>;
  llamaPayFactory?: Maybe<LlamaPayFactory>;
  stream?: Maybe<Stream>;
  streams: Array<Stream>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryHistoryEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryHistoryEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HistoryEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HistoryEvent_Filter>;
};


export type QueryLlamaPayContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLlamaPayContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LlamaPayContract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LlamaPayContract_Filter>;
};


export type QueryLlamaPayFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LlamaPayFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LlamaPayFactory_Filter>;
};


export type QueryLlamaPayFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStreamArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStreamsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Stream_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Stream_Filter>;
};


export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Stream = {
  __typename?: 'Stream';
  active: Scalars['Boolean'];
  amountPerSec: Scalars['BigInt'];
  contract: LlamaPayContract;
  createdBlock: Scalars['BigInt'];
  createdTimestamp: Scalars['BigInt'];
  historicalEvents: Array<HistoryEvent>;
  id: Scalars['ID'];
  lastPaused: Scalars['BigInt'];
  paused: Scalars['Boolean'];
  pausedAmount: Scalars['BigInt'];
  payee: User;
  payer: User;
  reason?: Maybe<Scalars['String']>;
  streamId: Scalars['Bytes'];
  token: Token;
  users: Array<User>;
};


export type StreamHistoricalEventsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HistoryEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<HistoryEvent_Filter>;
};


export type StreamUsersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<User_Filter>;
};

export type Stream_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  active?: InputMaybe<Scalars['Boolean']>;
  active_in?: InputMaybe<Array<Scalars['Boolean']>>;
  active_not?: InputMaybe<Scalars['Boolean']>;
  active_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  amountPerSec?: InputMaybe<Scalars['BigInt']>;
  amountPerSec_gt?: InputMaybe<Scalars['BigInt']>;
  amountPerSec_gte?: InputMaybe<Scalars['BigInt']>;
  amountPerSec_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amountPerSec_lt?: InputMaybe<Scalars['BigInt']>;
  amountPerSec_lte?: InputMaybe<Scalars['BigInt']>;
  amountPerSec_not?: InputMaybe<Scalars['BigInt']>;
  amountPerSec_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Stream_Filter>>>;
  contract?: InputMaybe<Scalars['String']>;
  contract_?: InputMaybe<LlamaPayContract_Filter>;
  contract_contains?: InputMaybe<Scalars['String']>;
  contract_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_ends_with?: InputMaybe<Scalars['String']>;
  contract_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_gt?: InputMaybe<Scalars['String']>;
  contract_gte?: InputMaybe<Scalars['String']>;
  contract_in?: InputMaybe<Array<Scalars['String']>>;
  contract_lt?: InputMaybe<Scalars['String']>;
  contract_lte?: InputMaybe<Scalars['String']>;
  contract_not?: InputMaybe<Scalars['String']>;
  contract_not_contains?: InputMaybe<Scalars['String']>;
  contract_not_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_not_ends_with?: InputMaybe<Scalars['String']>;
  contract_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_not_in?: InputMaybe<Array<Scalars['String']>>;
  contract_not_starts_with?: InputMaybe<Scalars['String']>;
  contract_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contract_starts_with?: InputMaybe<Scalars['String']>;
  contract_starts_with_nocase?: InputMaybe<Scalars['String']>;
  createdBlock?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlock_lt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_lte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  historicalEvents_?: InputMaybe<HistoryEvent_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastPaused?: InputMaybe<Scalars['BigInt']>;
  lastPaused_gt?: InputMaybe<Scalars['BigInt']>;
  lastPaused_gte?: InputMaybe<Scalars['BigInt']>;
  lastPaused_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastPaused_lt?: InputMaybe<Scalars['BigInt']>;
  lastPaused_lte?: InputMaybe<Scalars['BigInt']>;
  lastPaused_not?: InputMaybe<Scalars['BigInt']>;
  lastPaused_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Stream_Filter>>>;
  paused?: InputMaybe<Scalars['Boolean']>;
  pausedAmount?: InputMaybe<Scalars['BigInt']>;
  pausedAmount_gt?: InputMaybe<Scalars['BigInt']>;
  pausedAmount_gte?: InputMaybe<Scalars['BigInt']>;
  pausedAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  pausedAmount_lt?: InputMaybe<Scalars['BigInt']>;
  pausedAmount_lte?: InputMaybe<Scalars['BigInt']>;
  pausedAmount_not?: InputMaybe<Scalars['BigInt']>;
  pausedAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  paused_in?: InputMaybe<Array<Scalars['Boolean']>>;
  paused_not?: InputMaybe<Scalars['Boolean']>;
  paused_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  payee?: InputMaybe<Scalars['String']>;
  payee_?: InputMaybe<User_Filter>;
  payee_contains?: InputMaybe<Scalars['String']>;
  payee_contains_nocase?: InputMaybe<Scalars['String']>;
  payee_ends_with?: InputMaybe<Scalars['String']>;
  payee_ends_with_nocase?: InputMaybe<Scalars['String']>;
  payee_gt?: InputMaybe<Scalars['String']>;
  payee_gte?: InputMaybe<Scalars['String']>;
  payee_in?: InputMaybe<Array<Scalars['String']>>;
  payee_lt?: InputMaybe<Scalars['String']>;
  payee_lte?: InputMaybe<Scalars['String']>;
  payee_not?: InputMaybe<Scalars['String']>;
  payee_not_contains?: InputMaybe<Scalars['String']>;
  payee_not_contains_nocase?: InputMaybe<Scalars['String']>;
  payee_not_ends_with?: InputMaybe<Scalars['String']>;
  payee_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  payee_not_in?: InputMaybe<Array<Scalars['String']>>;
  payee_not_starts_with?: InputMaybe<Scalars['String']>;
  payee_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  payee_starts_with?: InputMaybe<Scalars['String']>;
  payee_starts_with_nocase?: InputMaybe<Scalars['String']>;
  payer?: InputMaybe<Scalars['String']>;
  payer_?: InputMaybe<User_Filter>;
  payer_contains?: InputMaybe<Scalars['String']>;
  payer_contains_nocase?: InputMaybe<Scalars['String']>;
  payer_ends_with?: InputMaybe<Scalars['String']>;
  payer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  payer_gt?: InputMaybe<Scalars['String']>;
  payer_gte?: InputMaybe<Scalars['String']>;
  payer_in?: InputMaybe<Array<Scalars['String']>>;
  payer_lt?: InputMaybe<Scalars['String']>;
  payer_lte?: InputMaybe<Scalars['String']>;
  payer_not?: InputMaybe<Scalars['String']>;
  payer_not_contains?: InputMaybe<Scalars['String']>;
  payer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  payer_not_ends_with?: InputMaybe<Scalars['String']>;
  payer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  payer_not_in?: InputMaybe<Array<Scalars['String']>>;
  payer_not_starts_with?: InputMaybe<Scalars['String']>;
  payer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  payer_starts_with?: InputMaybe<Scalars['String']>;
  payer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  reason?: InputMaybe<Scalars['String']>;
  reason_contains?: InputMaybe<Scalars['String']>;
  reason_contains_nocase?: InputMaybe<Scalars['String']>;
  reason_ends_with?: InputMaybe<Scalars['String']>;
  reason_ends_with_nocase?: InputMaybe<Scalars['String']>;
  reason_gt?: InputMaybe<Scalars['String']>;
  reason_gte?: InputMaybe<Scalars['String']>;
  reason_in?: InputMaybe<Array<Scalars['String']>>;
  reason_lt?: InputMaybe<Scalars['String']>;
  reason_lte?: InputMaybe<Scalars['String']>;
  reason_not?: InputMaybe<Scalars['String']>;
  reason_not_contains?: InputMaybe<Scalars['String']>;
  reason_not_contains_nocase?: InputMaybe<Scalars['String']>;
  reason_not_ends_with?: InputMaybe<Scalars['String']>;
  reason_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  reason_not_in?: InputMaybe<Array<Scalars['String']>>;
  reason_not_starts_with?: InputMaybe<Scalars['String']>;
  reason_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  reason_starts_with?: InputMaybe<Scalars['String']>;
  reason_starts_with_nocase?: InputMaybe<Scalars['String']>;
  streamId?: InputMaybe<Scalars['Bytes']>;
  streamId_contains?: InputMaybe<Scalars['Bytes']>;
  streamId_gt?: InputMaybe<Scalars['Bytes']>;
  streamId_gte?: InputMaybe<Scalars['Bytes']>;
  streamId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  streamId_lt?: InputMaybe<Scalars['Bytes']>;
  streamId_lte?: InputMaybe<Scalars['Bytes']>;
  streamId_not?: InputMaybe<Scalars['Bytes']>;
  streamId_not_contains?: InputMaybe<Scalars['Bytes']>;
  streamId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  token?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_Filter>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  users?: InputMaybe<Array<Scalars['String']>>;
  users_?: InputMaybe<User_Filter>;
  users_contains?: InputMaybe<Array<Scalars['String']>>;
  users_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  users_not?: InputMaybe<Array<Scalars['String']>>;
  users_not_contains?: InputMaybe<Array<Scalars['String']>>;
  users_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
};

export enum Stream_OrderBy {
  Active = 'active',
  AmountPerSec = 'amountPerSec',
  Contract = 'contract',
  ContractAddress = 'contract__address',
  ContractCreatedBlock = 'contract__createdBlock',
  ContractCreatedTimestamp = 'contract__createdTimestamp',
  ContractId = 'contract__id',
  CreatedBlock = 'createdBlock',
  CreatedTimestamp = 'createdTimestamp',
  HistoricalEvents = 'historicalEvents',
  Id = 'id',
  LastPaused = 'lastPaused',
  Paused = 'paused',
  PausedAmount = 'pausedAmount',
  Payee = 'payee',
  PayeeAddress = 'payee__address',
  PayeeCreatedBlock = 'payee__createdBlock',
  PayeeCreatedTimestamp = 'payee__createdTimestamp',
  PayeeId = 'payee__id',
  Payer = 'payer',
  PayerAddress = 'payer__address',
  PayerCreatedBlock = 'payer__createdBlock',
  PayerCreatedTimestamp = 'payer__createdTimestamp',
  PayerId = 'payer__id',
  Reason = 'reason',
  StreamId = 'streamId',
  Token = 'token',
  TokenAddress = 'token__address',
  TokenCreatedBlock = 'token__createdBlock',
  TokenCreatedTimestamp = 'token__createdTimestamp',
  TokenDecimals = 'token__decimals',
  TokenId = 'token__id',
  TokenName = 'token__name',
  TokenSymbol = 'token__symbol',
  Users = 'users'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  historyEvent?: Maybe<HistoryEvent>;
  historyEvents: Array<HistoryEvent>;
  llamaPayContract?: Maybe<LlamaPayContract>;
  llamaPayContracts: Array<LlamaPayContract>;
  llamaPayFactories: Array<LlamaPayFactory>;
  llamaPayFactory?: Maybe<LlamaPayFactory>;
  stream?: Maybe<Stream>;
  streams: Array<Stream>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionHistoryEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionHistoryEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HistoryEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HistoryEvent_Filter>;
};


export type SubscriptionLlamaPayContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLlamaPayContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LlamaPayContract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LlamaPayContract_Filter>;
};


export type SubscriptionLlamaPayFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LlamaPayFactory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LlamaPayFactory_Filter>;
};


export type SubscriptionLlamaPayFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStreamArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStreamsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Stream_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Stream_Filter>;
};


export type SubscriptionTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};


export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Token = {
  __typename?: 'Token';
  address: Scalars['Bytes'];
  contract: LlamaPayContract;
  createdBlock: Scalars['BigInt'];
  createdTimestamp: Scalars['BigInt'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  name: Scalars['String'];
  symbol: Scalars['String'];
};

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  contract?: InputMaybe<Scalars['String']>;
  contract_?: InputMaybe<LlamaPayContract_Filter>;
  contract_contains?: InputMaybe<Scalars['String']>;
  contract_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_ends_with?: InputMaybe<Scalars['String']>;
  contract_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_gt?: InputMaybe<Scalars['String']>;
  contract_gte?: InputMaybe<Scalars['String']>;
  contract_in?: InputMaybe<Array<Scalars['String']>>;
  contract_lt?: InputMaybe<Scalars['String']>;
  contract_lte?: InputMaybe<Scalars['String']>;
  contract_not?: InputMaybe<Scalars['String']>;
  contract_not_contains?: InputMaybe<Scalars['String']>;
  contract_not_contains_nocase?: InputMaybe<Scalars['String']>;
  contract_not_ends_with?: InputMaybe<Scalars['String']>;
  contract_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contract_not_in?: InputMaybe<Array<Scalars['String']>>;
  contract_not_starts_with?: InputMaybe<Scalars['String']>;
  contract_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contract_starts_with?: InputMaybe<Scalars['String']>;
  contract_starts_with_nocase?: InputMaybe<Scalars['String']>;
  createdBlock?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlock_lt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_lte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Token_OrderBy {
  Address = 'address',
  Contract = 'contract',
  ContractAddress = 'contract__address',
  ContractCreatedBlock = 'contract__createdBlock',
  ContractCreatedTimestamp = 'contract__createdTimestamp',
  ContractId = 'contract__id',
  CreatedBlock = 'createdBlock',
  CreatedTimestamp = 'createdTimestamp',
  Decimals = 'decimals',
  Id = 'id',
  Name = 'name',
  Symbol = 'symbol'
}

export type User = {
  __typename?: 'User';
  address: Scalars['Bytes'];
  createdBlock: Scalars['BigInt'];
  createdTimestamp: Scalars['BigInt'];
  historicalEvents: Array<HistoryEvent>;
  id: Scalars['ID'];
  streams: Array<Stream>;
};


export type UserHistoricalEventsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HistoryEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<HistoryEvent_Filter>;
};


export type UserStreamsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Stream_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Stream_Filter>;
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  createdBlock?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_gte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlock_lt?: InputMaybe<Scalars['BigInt']>;
  createdBlock_lte?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not?: InputMaybe<Scalars['BigInt']>;
  createdBlock_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  createdTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  historicalEvents_?: InputMaybe<HistoryEvent_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  streams_?: InputMaybe<Stream_Filter>;
};

export enum User_OrderBy {
  Address = 'address',
  CreatedBlock = 'createdBlock',
  CreatedTimestamp = 'createdTimestamp',
  HistoricalEvents = 'historicalEvents',
  Id = 'id',
  Streams = 'streams'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type GetAllTokensQueryVariables = Exact<{
  network: Scalars['String'];
}>;


export type GetAllTokensQuery = { __typename?: 'Query', tokens: Array<{ __typename?: 'Token', address: any, symbol: string, name: string, decimals: number, contract: { __typename?: 'LlamaPayContract', id: string } }> };

export type StreamAndHistoryQueryVariables = Exact<{
  id: Scalars['ID'];
  network: Scalars['String'];
}>;


export type StreamAndHistoryQuery = { __typename?: 'Query', user?: { __typename?: 'User', streams: Array<{ __typename?: 'Stream', streamId: any, active: boolean, reason?: string | null, paused: boolean, pausedAmount: any, lastPaused: any, amountPerSec: any, createdTimestamp: any, contract: { __typename?: 'LlamaPayContract', address: any }, payer: { __typename?: 'User', id: string }, payee: { __typename?: 'User', id: string }, token: { __typename?: 'Token', address: any, name: string, decimals: number, symbol: string }, historicalEvents: Array<{ __typename?: 'HistoryEvent', eventType: string, txHash: any, createdTimestamp: any }> }>, historicalEvents: Array<{ __typename?: 'HistoryEvent', txHash: any, eventType: string, amount?: any | null, createdTimestamp: any, users: Array<{ __typename?: 'User', id: string }>, stream?: { __typename?: 'Stream', streamId: any, amountPerSec: any, createdTimestamp: any, payer: { __typename?: 'User', id: string }, payee: { __typename?: 'User', id: string }, token: { __typename?: 'Token', address: any, name: string, decimals: number, symbol: string } } | null, oldStream?: { __typename?: 'Stream', streamId: any, amountPerSec: any, createdTimestamp: any, payer: { __typename?: 'User', id: string }, payee: { __typename?: 'User', id: string }, token: { __typename?: 'Token', address: any, symbol: string } } | null, token: { __typename?: 'Token', symbol: string, decimals: number } }> } | null };

export type UserStreamFragment = { __typename?: 'Stream', streamId: any, active: boolean, reason?: string | null, paused: boolean, pausedAmount: any, lastPaused: any, amountPerSec: any, createdTimestamp: any, contract: { __typename?: 'LlamaPayContract', address: any }, payer: { __typename?: 'User', id: string }, payee: { __typename?: 'User', id: string }, token: { __typename?: 'Token', address: any, name: string, decimals: number, symbol: string }, historicalEvents: Array<{ __typename?: 'HistoryEvent', eventType: string, txHash: any, createdTimestamp: any }> };

export type UserHistoryFragment = { __typename?: 'HistoryEvent', txHash: any, eventType: string, amount?: any | null, createdTimestamp: any, users: Array<{ __typename?: 'User', id: string }>, stream?: { __typename?: 'Stream', streamId: any, amountPerSec: any, createdTimestamp: any, payer: { __typename?: 'User', id: string }, payee: { __typename?: 'User', id: string }, token: { __typename?: 'Token', address: any, name: string, decimals: number, symbol: string } } | null, oldStream?: { __typename?: 'Stream', streamId: any, amountPerSec: any, createdTimestamp: any, payer: { __typename?: 'User', id: string }, payee: { __typename?: 'User', id: string }, token: { __typename?: 'Token', address: any, symbol: string } } | null, token: { __typename?: 'Token', symbol: string, decimals: number } };

export type StreamByIdQueryVariables = Exact<{
  id: Scalars['Bytes'];
  network: Scalars['String'];
}>;


export type StreamByIdQuery = { __typename?: 'Query', streams: Array<{ __typename?: 'Stream', streamId: any, active: boolean, reason?: string | null, paused: boolean, pausedAmount: any, lastPaused: any, amountPerSec: any, createdTimestamp: any, contract: { __typename?: 'LlamaPayContract', address: any }, payer: { __typename?: 'User', id: string }, payee: { __typename?: 'User', id: string }, token: { __typename?: 'Token', address: any, name: string, decimals: number, symbol: string }, historicalEvents: Array<{ __typename?: 'HistoryEvent', eventType: string, txHash: any, createdTimestamp: any }> }> };

export const UserStreamFragmentDoc = `
    fragment UserStream on Stream {
  streamId
  contract {
    address
  }
  payer {
    id
  }
  payee {
    id
  }
  token {
    address
    name
    decimals
    symbol
  }
  historicalEvents(orderBy: createdTimestamp, orderDirection: desc) {
    eventType
    txHash
    createdTimestamp
  }
  active
  reason
  paused
  pausedAmount
  lastPaused
  amountPerSec
  createdTimestamp
}
    `;
export const UserHistoryFragmentDoc = `
    fragment UserHistory on HistoryEvent {
  txHash
  eventType
  users {
    id
  }
  stream {
    streamId
    payer {
      id
    }
    payee {
      id
    }
    token {
      address
      name
      decimals
      symbol
    }
    amountPerSec
    createdTimestamp
  }
  oldStream {
    streamId
    payer {
      id
    }
    payee {
      id
    }
    token {
      address
      symbol
    }
    amountPerSec
    createdTimestamp
  }
  token {
    symbol
    decimals
  }
  amount
  createdTimestamp
}
    `;
export const GetAllTokensDocument = `
    query GetAllTokens($network: String!) {
  tokens(first: 100) {
    address
    symbol
    name
    decimals
    contract {
      id
    }
  }
}
    `;
export const useGetAllTokensQuery = <
      TData = GetAllTokensQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: GetAllTokensQueryVariables,
      options?: UseQueryOptions<GetAllTokensQuery, TError, TData>
    ) =>
    useQuery<GetAllTokensQuery, TError, TData>(
      ['GetAllTokens', variables],
      fetcher<GetAllTokensQuery, GetAllTokensQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetAllTokensDocument, variables),
      options
    );

useGetAllTokensQuery.getKey = (variables: GetAllTokensQueryVariables) => ['GetAllTokens', variables];
;

useGetAllTokensQuery.fetcher = (dataSource: { endpoint: string, fetchParams?: RequestInit }, variables: GetAllTokensQueryVariables) => fetcher<GetAllTokensQuery, GetAllTokensQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, GetAllTokensDocument, variables);
export const StreamAndHistoryDocument = `
    query StreamAndHistory($id: ID!, $network: String!) {
  user(id: $id) {
    streams(orderBy: createdTimestamp, orderDirection: desc, where: {active: true}) {
      ...UserStream
    }
    historicalEvents(orderBy: createdTimestamp, orderDirection: desc, first: 1000) {
      ...UserHistory
    }
  }
}
    ${UserStreamFragmentDoc}
${UserHistoryFragmentDoc}`;
export const useStreamAndHistoryQuery = <
      TData = StreamAndHistoryQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: StreamAndHistoryQueryVariables,
      options?: UseQueryOptions<StreamAndHistoryQuery, TError, TData>
    ) =>
    useQuery<StreamAndHistoryQuery, TError, TData>(
      ['StreamAndHistory', variables],
      fetcher<StreamAndHistoryQuery, StreamAndHistoryQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, StreamAndHistoryDocument, variables),
      options
    );

useStreamAndHistoryQuery.getKey = (variables: StreamAndHistoryQueryVariables) => ['StreamAndHistory', variables];
;

useStreamAndHistoryQuery.fetcher = (dataSource: { endpoint: string, fetchParams?: RequestInit }, variables: StreamAndHistoryQueryVariables) => fetcher<StreamAndHistoryQuery, StreamAndHistoryQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, StreamAndHistoryDocument, variables);
export const StreamByIdDocument = `
    query StreamById($id: Bytes!, $network: String!) {
  streams(where: {streamId: $id}) {
    ...UserStream
  }
}
    ${UserStreamFragmentDoc}`;
export const useStreamByIdQuery = <
      TData = StreamByIdQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: StreamByIdQueryVariables,
      options?: UseQueryOptions<StreamByIdQuery, TError, TData>
    ) =>
    useQuery<StreamByIdQuery, TError, TData>(
      ['StreamById', variables],
      fetcher<StreamByIdQuery, StreamByIdQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, StreamByIdDocument, variables),
      options
    );

useStreamByIdQuery.getKey = (variables: StreamByIdQueryVariables) => ['StreamById', variables];
;

useStreamByIdQuery.fetcher = (dataSource: { endpoint: string, fetchParams?: RequestInit }, variables: StreamByIdQueryVariables) => fetcher<StreamByIdQuery, StreamByIdQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, StreamByIdDocument, variables);