"use client";

import { FC, FormEventHandler, useState, useEffect } from "react";
import {
  DynamicContextProvider,
  useConnectWithOtp,
  useDynamicContext,
  getAuthToken,
  useSocialAccounts,
} from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { ProviderEnum } from "@dynamic-labs/types";

const ConnectWithEmailView: FC = () => {
  const { user, handleLogOut } = useDynamicContext();
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();
  const { signInWithSocialAccount, isProcessing: isSocialProcessing } =
    useSocialAccounts();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const token = getAuthToken();
      console.log("JWT Token:", token);
    }
  }, [user]);

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const email = (event.currentTarget.email as HTMLInputElement).value;
      await connectWithEmail(email);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const otp = (event.currentTarget.otp as HTMLInputElement).value;
      await verifyOneTimePassword(otp);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await handleLogOut();
    } finally {
      setIsLoading(false);
    }
  };

  const getEssentialInfo = (user: any) => {
    const walletInfo = user.verifiedCredentials.find(
      (cred: any) => cred.format === "blockchain"
    );

    return {
      email: user.email || "N/A",
      address: walletInfo?.address || "N/A",
      chain: walletInfo?.chain || "N/A",
      format: walletInfo?.format || "N/A",
    };
  };

  return (
    <div className="relative w-[400px] bg-black/90 text-gray-200 rounded-lg overflow-hidden border border-green-500/30">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20 animate-pulse"></div>

      {/* Header */}
      <div className="relative border-b border-green-500/30 bg-black/50 p-4">
        <h2 className="text-2xl font-bold text-green-500 tracking-wider">
          SECURE LOGIN
        </h2>
        <div className="absolute top-0 right-0 w-20 h-1 bg-green-500/50 animate-pulse"></div>
      </div>

      <div className="relative p-6 space-y-6">
        {!user ? (
          <>
            <div className="space-y-4">
              <div className="text-sm text-green-400 uppercase tracking-wider mb-3">
                SOCIAL LOGIN
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => signInWithSocialAccount(ProviderEnum.Google)}
                  disabled={isSocialProcessing}
                  className="flex items-center justify-center gap-2 bg-white text-gray-800 px-4 py-3 rounded
                           hover:bg-gray-100 transition-all duration-200 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => signInWithSocialAccount(ProviderEnum.Telegram)}
                  disabled={isSocialProcessing}
                  className="flex items-center justify-center gap-2 bg-[#0088cc] text-white px-4 py-3 rounded
                           hover:bg-[#0099ee] transition-all duration-200 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.05.01.13 0 .21z"
                    />
                  </svg>
                  Telegram
                </button>
              </div>
            </div>

            <div className="relative flex items-center gap-3 my-6">
              <div className="flex-grow h-px bg-green-500/30"></div>
              <span className="text-green-400 text-sm">OR</span>
              <div className="flex-grow h-px bg-green-500/30"></div>
            </div>

            <form
              key="email-form"
              onSubmit={onSubmitEmailHandler}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm text-green-400 uppercase tracking-wider">
                  OPERATOR ID (Email)
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full bg-black/50 border border-green-500/30 text-green-400 px-4 py-3 rounded 
                           focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                           placeholder:text-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-4 rounded
                         transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         uppercase tracking-wider"
              >
                {isLoading ? "AUTHENTICATING..." : "REQUEST ACCESS CODE"}
              </button>
            </form>

            <form
              key="otp-form"
              onSubmit={onSubmitOtpHandler}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm text-green-400 uppercase tracking-wider">
                  ACCESS CODE
                </label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter verification code"
                  className="w-full bg-black/50 border border-green-500/30 text-green-400 px-4 py-3 rounded
                           focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                           placeholder:text-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-4 rounded
                         transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         uppercase tracking-wider"
              >
                {isLoading ? "VERIFYING..." : "VERIFY CODE"}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[#00ff47] uppercase tracking-wider text-xl font-bold">
                AUTHENTICATION SUCCESSFUL
              </h3>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="px-4 py-2 bg-[#ff2e2e]/80 hover:bg-[#ff2e2e] text-white rounded
                         transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         uppercase tracking-wider text-sm border border-[#ff2e2e]/30
                         flex items-center gap-2"
              >
                {isLoading ? (
                  "DISCONNECTING..."
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    LOGOUT
                  </>
                )}
              </button>
            </div>
            <div className="bg-[#001a00]/50 border border-[#00ff47]/30 p-6 rounded space-y-4">
              {Object.entries(getEssentialInfo(user)).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-[120px_1fr] items-center gap-4"
                >
                  <span className="text-[#00ff47] uppercase text-sm tracking-[0.2em] font-bold">
                    {key}
                  </span>
                  <span className="text-[#e6ffe6] font-mono text-sm break-all bg-black/30 p-2 rounded">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with decorative elements */}
      <div className="relative h-2 bg-black/50">
        <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-green-500/50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-1 bg-green-500/30"></div>
      </div>
    </div>
  );
};

export default function Dynamic() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "ea80668b-bb51-4fe0-b562-76ae13993a64",
        walletConnectors: [SolanaWalletConnectors],
        socialProviders: {
          google: {
            enabled: true,
          },
          telegram: {
            enabled: true,
          },
        },
      }}
    >
      <ConnectWithEmailView />
    </DynamicContextProvider>
  );
}
