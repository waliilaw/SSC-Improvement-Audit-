/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/wager_program.json`.
 */
export type WagerProgram = {
  "address": "8PRQvPo16yG8EP5fESDEuJunZBLJ3UFBGvN6CKLZGBUQ",
  "metadata": {
    "name": "wagerProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createGameSession",
      "discriminator": [
        130,
        34,
        251,
        80,
        77,
        159,
        113,
        224
      ],
      "accounts": [
        {
          "name": "gameServer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint",
          "writable": true,
          "address": "BzeqmCjLZvMLSTrge9qZnyV8N2zNKBwAxQcZH2XEzFXG"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sessionId",
          "type": "string"
        },
        {
          "name": "betAmount",
          "type": "u64"
        },
        {
          "name": "gameMode",
          "type": {
            "defined": {
              "name": "gameMode"
            }
          }
        }
      ]
    },
    {
      "name": "distributeWinnings",
      "discriminator": [
        208,
        254,
        127,
        148,
        78,
        104,
        249,
        250
      ],
      "accounts": [
        {
          "name": "gameServer",
          "docs": [
            "The game server authority that created the session"
          ],
          "signer": true
        },
        {
          "name": "gameSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "const",
                "value": [
                  163,
                  89,
                  195,
                  20,
                  36,
                  68,
                  115,
                  155,
                  147,
                  107,
                  39,
                  204,
                  7,
                  172,
                  237,
                  155,
                  208,
                  225,
                  90,
                  198,
                  138,
                  212,
                  176,
                  112,
                  94,
                  199,
                  189,
                  52,
                  211,
                  144,
                  68,
                  139
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sessionId",
          "type": "string"
        },
        {
          "name": "winningTeam",
          "type": "u8"
        }
      ]
    },
    {
      "name": "joinUser",
      "discriminator": [
        34,
        15,
        119,
        81,
        119,
        149,
        25,
        240
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameServer"
        },
        {
          "name": "gameSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint",
          "writable": true,
          "address": "BzeqmCjLZvMLSTrge9qZnyV8N2zNKBwAxQcZH2XEzFXG"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sessionId",
          "type": "string"
        },
        {
          "name": "team",
          "type": "u8"
        }
      ]
    },
    {
      "name": "payToSpawn",
      "discriminator": [
        55,
        158,
        177,
        30,
        46,
        243,
        227,
        129
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameServer"
        },
        {
          "name": "gameSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "const",
                "value": [
                  163,
                  89,
                  195,
                  20,
                  36,
                  68,
                  115,
                  155,
                  147,
                  107,
                  39,
                  204,
                  7,
                  172,
                  237,
                  155,
                  208,
                  225,
                  90,
                  198,
                  138,
                  212,
                  176,
                  112,
                  94,
                  199,
                  189,
                  52,
                  211,
                  144,
                  68,
                  139
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sessionId",
          "type": "string"
        },
        {
          "name": "team",
          "type": "u8"
        }
      ]
    },
    {
      "name": "recordKill",
      "discriminator": [
        199,
        67,
        232,
        200,
        144,
        122,
        230,
        56
      ],
      "accounts": [
        {
          "name": "gameSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "gameServer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "sessionId",
          "type": "string"
        },
        {
          "name": "killerTeam",
          "type": "u8"
        },
        {
          "name": "killer",
          "type": "pubkey"
        },
        {
          "name": "victimTeam",
          "type": "u8"
        },
        {
          "name": "victim",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "refundWager",
      "discriminator": [
        208,
        62,
        96,
        78,
        126,
        46,
        251,
        157
      ],
      "accounts": [
        {
          "name": "gameServer",
          "docs": [
            "The game server authority that created the session"
          ],
          "signer": true
        },
        {
          "name": "gameSession",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "sessionId"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "const",
                "value": [
                  163,
                  89,
                  195,
                  20,
                  36,
                  68,
                  115,
                  155,
                  147,
                  107,
                  39,
                  204,
                  7,
                  172,
                  237,
                  155,
                  208,
                  225,
                  90,
                  198,
                  138,
                  212,
                  176,
                  112,
                  94,
                  199,
                  189,
                  52,
                  211,
                  144,
                  68,
                  139
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sessionId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameSession",
      "discriminator": [
        150,
        116,
        20,
        197,
        205,
        121,
        220,
        240
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidGameState",
      "msg": "Game session is not in the correct state"
    },
    {
      "code": 6001,
      "name": "invalidTeamSelection",
      "msg": "Invalid team selection. Team must be 0 or 1"
    },
    {
      "code": 6002,
      "name": "teamIsFull",
      "msg": "Team is already full"
    },
    {
      "code": 6003,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to join the game"
    },
    {
      "code": 6004,
      "name": "invalidPlayerCount",
      "msg": "Invalid number of players for this game mode"
    },
    {
      "code": 6005,
      "name": "notAllPlayersJoined",
      "msg": "All players not joined"
    },
    {
      "code": 6006,
      "name": "gameNotCompleted",
      "msg": "Game is not in completed state"
    },
    {
      "code": 6007,
      "name": "unauthorizedDistribution",
      "msg": "Only the game authority can distribute winnings"
    },
    {
      "code": 6008,
      "name": "invalidWinningTeam",
      "msg": "Invalid winning team selection"
    },
    {
      "code": 6009,
      "name": "totalPotCalculationError",
      "msg": "Failed to calculate total pot due to arithmetic overflow"
    },
    {
      "code": 6010,
      "name": "noWinnersFound",
      "msg": "No winners found in the winning team"
    },
    {
      "code": 6011,
      "name": "winningsCalculationError",
      "msg": "Failed to calculate per-player winnings"
    },
    {
      "code": 6012,
      "name": "incompleteDistribution",
      "msg": "Failed to distribute all funds from game session"
    },
    {
      "code": 6013,
      "name": "invalidTeam",
      "msg": "Invalid team"
    },
    {
      "code": 6014,
      "name": "playerAccountNotFound",
      "msg": "Player account not found in winners"
    },
    {
      "code": 6015,
      "name": "invalidWinner",
      "msg": "Invalid winning team selection"
    },
    {
      "code": 6016,
      "name": "arithmeticError",
      "msg": "Arithmetic error"
    },
    {
      "code": 6017,
      "name": "invalidMint",
      "msg": "Invalid mint address provided"
    },
    {
      "code": 6018,
      "name": "invalidRemainingAccounts",
      "msg": "Invalid remaining accounts provided"
    },
    {
      "code": 6019,
      "name": "invalidWinnerTokenAccount",
      "msg": "Invalid winner token account owner"
    },
    {
      "code": 6020,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6021,
      "name": "invalidSpawns",
      "msg": "Invalid spawns"
    },
    {
      "code": 6022,
      "name": "unauthorizedKill",
      "msg": "Unauthorized kill"
    },
    {
      "code": 6023,
      "name": "unauthorizedPayToSpawn",
      "msg": "Unauthorized pay to spawn"
    },
    {
      "code": 6024,
      "name": "playerNotFound",
      "msg": "Player not found"
    },
    {
      "code": 6025,
      "name": "invalidPlayerTokenAccount",
      "msg": "Invalid player token account"
    },
    {
      "code": 6026,
      "name": "invalidPlayer",
      "msg": "Invalid player"
    },
    {
      "code": 6027,
      "name": "playerHasNoSpawns",
      "msg": "Player has no spawns"
    },
    {
      "code": 6028,
      "name": "gameNotInProgress",
      "msg": "Game is not in progress"
    }
  ],
  "types": [
    {
      "name": "gameMode",
      "docs": [
        "Game mode defining the team sizes"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "winnerTakesAllOneVsOne"
          },
          {
            "name": "winnerTakesAllThreeVsThree"
          },
          {
            "name": "winnerTakesAllFiveVsFive"
          },
          {
            "name": "payToSpawnOneVsOne"
          },
          {
            "name": "payToSpawnThreeVsThree"
          },
          {
            "name": "payToSpawnFiveVsFive"
          }
        ]
      }
    },
    {
      "name": "gameSession",
      "docs": [
        "Represents a game session between teams with its own pool"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "sessionBet",
            "type": "u64"
          },
          {
            "name": "gameMode",
            "type": {
              "defined": {
                "name": "gameMode"
              }
            }
          },
          {
            "name": "teamA",
            "type": {
              "defined": {
                "name": "team"
              }
            }
          },
          {
            "name": "teamB",
            "type": {
              "defined": {
                "name": "team"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "gameStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "vaultTokenBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameStatus",
      "docs": [
        "Status of a game session"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "waitingForPlayers"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "completed"
          }
        ]
      }
    },
    {
      "name": "team",
      "docs": [
        "Represents a team in the game"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "players",
            "type": {
              "array": [
                "pubkey",
                5
              ]
            }
          },
          {
            "name": "totalBet",
            "type": "u64"
          },
          {
            "name": "playerSpawns",
            "type": {
              "array": [
                "u16",
                5
              ]
            }
          },
          {
            "name": "playerKills",
            "type": {
              "array": [
                "u16",
                5
              ]
            }
          }
        ]
      }
    }
  ]
};
