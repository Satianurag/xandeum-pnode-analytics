"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatState } from "./use-chat-state";
import { ChatStatusIndicator } from "./chat-status-indicator";
import PlusIcon from "../icons/plus";
import MinusIcon from "../icons/minus";
import ArrowLeftIcon from "../icons/arrow-left";
import { useIsV0 } from "@/lib/v0-context";
import { getCurrentUser } from "@/lib/chat-utils";
import { useWalletState } from "@/contexts/wallet-context";
import { verifyNodeOperator, truncateAddress, type OperatorVerification } from "@/lib/verify-operator";

interface ChatHeaderProps {
  onClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  variant?: "desktop" | "mobile";
  className?: string;
}

export function ChatHeader({
  onClick,
  showBackButton = false,
  onBackClick,
  variant = "desktop",
  className,
}: ChatHeaderProps) {
  const {
    chatState,
    totalUnreadCount,
    activeConversation,
    goBack,
    toggleExpanded,
  } = useChatState();

  const isV0 = useIsV0();
  const currentUser = getCurrentUser();
  const { connected, publicKey } = useWalletState();
  const [operatorStatus, setOperatorStatus] = useState<OperatorVerification>({ isOperator: false });

  // Verify if connected wallet is a node operator
  useEffect(() => {
    if (connected && publicKey) {
      verifyNodeOperator(publicKey).then(setOperatorStatus);
    } else {
      setOperatorStatus({ isOperator: false });
    }
  }, [connected, publicKey]);

  const hasNewMessages = totalUnreadCount > 0;
  const shouldHighlightUnreadMessages =
    variant === "mobile"
      ? false
      : chatState.state === "collapsed" && hasNewMessages;
  const otherUser = activeConversation?.participants.find(
    (p) => p.id !== currentUser.id
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (variant === "desktop") {
      toggleExpanded();
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBackClick) {
      onBackClick();
    } else {
      goBack();
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        "cursor-pointer flex items-center gap-3 transition-all duration-300",
        shouldHighlightUnreadMessages
          ? "w-full h-14 bg-primary text-primary-foreground rounded-t-lg px-4 py-3"
          : cn(
            "w-full bg-background text-foreground rounded-t-lg px-4 py-3 transition-all duration-300",
            chatState.state === "collapsed" ? "h-10" : "h-14"
          ),
        className
      )}
      onClick={handleClick}
    >
      <AnimatePresence mode={isV0 ? "wait" : "popLayout"}>
        {(showBackButton || chatState.state === "conversation") && (
          <motion.div
            key="back"
            initial={{ opacity: 0, scale: 0.8, translateX: "-100%" }}
            animate={{ opacity: 1, scale: 1, translateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateX: "-100%" }}
            transition={{ ease: "backInOut", duration: 0.4 }}
            className="flex items-center gap-1 group/back"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-foreground/50 p-1 pr-3"
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <Separator
              orientation="vertical"
              className="!h-6 group-hover/back:opacity-0 transition-opacity duration-300"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Content */}
      <motion.div layout className="flex items-center gap-2 flex-1">
        {/* Status Indicator */}
        <ChatStatusIndicator
          isExpanded={
            chatState.state === "expanded" || chatState.state === "conversation"
          }
          hasUnreadMessages={shouldHighlightUnreadMessages}
          unreadCount={totalUnreadCount}
        />

        {/* Dynamic Title */}
        <span className="text-sm font-medium uppercase">
          {(() => {
            // Mobile variant
            if (variant === "mobile") {
              if (chatState.state === "conversation") {
                return otherUser?.name || "CONVERSATION";
              }
              return "ONLINE";
            }

            // Desktop variant
            if (chatState.state === "collapsed") {
              return shouldHighlightUnreadMessages
                ? `${totalUnreadCount} New Message${totalUnreadCount > 1 ? "s" : ""
                }`
                : "Chat";
            }

            if (chatState.state === "conversation") {
              return otherUser?.name || "CONVERSATION";
            }

            return "ONLINE";
          })()}
        </span>

        {/* Wallet Verification Badge - Show when expanded and connected */}
        {variant === "desktop" && chatState.state !== "collapsed" && connected && publicKey && (
          <Badge
            variant={operatorStatus.isOperator ? "default" : "secondary"}
            className={cn(
              "ml-auto text-[10px] font-mono",
              operatorStatus.isOperator
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            {operatorStatus.isOperator ? "✓ " : "👤 "}
            {truncateAddress(publicKey)}
          </Badge>
        )}
      </motion.div>

      {/* Action Buttons */}
      {variant === "desktop" && (
        <AnimatePresence mode={isV0 ? "wait" : "popLayout"} initial={false}>
          <motion.div
            key={chatState.state}
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
          >
            {chatState.state === "collapsed" ? (
              <PlusIcon className="size-4" />
            ) : (
              <MinusIcon className="size-4" />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
