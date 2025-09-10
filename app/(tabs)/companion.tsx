import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence
} from 'react-native-reanimated';

import { useAICompanion } from '@/hooks/useAICompanion';
import { AIMessage } from '@/types';
import { NeoBrutalism } from '@/constants/Colors';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const { messages, isTyping, sendMessage } = useAICompanion();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const avatarScale = useSharedValue(1);
  const avatarGlow = useSharedValue(0);
  const typingOpacity = useSharedValue(0);

  useEffect(() => {
    if (isTyping) {
      typingOpacity.value = withSpring(1);
      avatarScale.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 6 }),
          withSpring(1, { damping: 6 })
        ),
        -1,
        true
      );
      avatarGlow.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 6 }),
          withSpring(0, { damping: 6 })
        ),
        -1,
        true
      );
    } else {
      typingOpacity.value = withSpring(0);
      avatarScale.value = withSpring(1);
      avatarGlow.value = withSpring(0);
    }
  }, [isTyping]);

  const handleSend = async () => {
    if (inputText.trim()) {
      await sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }]
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: avatarGlow.value
  }));

  const typingStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value
  }));

  const renderMessage = ({ item }: { item: AIMessage }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      {!item.isUser && (
        <Animated.View style={[styles.avatarContainer, avatarStyle]}>
          <View style={styles.avatar}>
            <MaterialIcons name="psychology" size={24} color={NeoBrutalism.void} />
          </View>
          <Animated.View style={[styles.avatarGlow, glowStyle]} />
        </Animated.View>
      )}
      
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.content}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <Animated.View style={[styles.headerAvatarContainer, avatarStyle]}>
            <View style={styles.headerAvatar}>
              <MaterialIcons name="psychology" size={32} color={NeoBrutalism.void} />
            </View>
            <Animated.View style={[styles.headerAvatarGlow, glowStyle]} />
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI COMPANION</Text>
            <Text style={styles.headerSubtitle}>
              {isTyping ? 'PROCESSING...' : '24/7 SUPPORT SYSTEM'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing Indicator */}
      <Animated.View style={[styles.typingContainer, typingStyle]}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.dot1]} />
            <View style={[styles.typingDot, styles.dot2]} />
            <View style={[styles.typingDot, styles.dot3]} />
          </View>
        </View>
      </Animated.View>

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="SHARE WHAT'S ON YOUR MIND..."
            placeholderTextColor={NeoBrutalism.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <AnimatedButton
            title="SEND"
            onPress={handleSend}
            variant={inputText.trim() ? 'primary' : 'ghost'}
            size="small"
            disabled={!inputText.trim() || isTyping}
            style={styles.sendButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NeoBrutalism.background
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: NeoBrutalism.border,
    backgroundColor: NeoBrutalism.surface
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAvatarContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    position: 'relative'
  },
  headerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: NeoBrutalism.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8
  },
  headerAvatarGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: NeoBrutalism.electric,
    borderRadius: 0,
    zIndex: -1
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: NeoBrutalism.text,
    letterSpacing: 2,
    textShadowColor: NeoBrutalism.primary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  },
  headerSubtitle: {
    fontSize: 14,
    color: NeoBrutalism.textSecondary,
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 1
  },
  messagesList: {
    flex: 1
  },
  messagesContent: {
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end'
  },
  userMessage: {
    justifyContent: 'flex-end'
  },
  aiMessage: {
    justifyContent: 'flex-start'
  },
  avatarContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    position: 'relative'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: NeoBrutalism.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: NeoBrutalism.electric,
    borderRadius: 0,
    zIndex: -1
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  userBubble: {
    backgroundColor: NeoBrutalism.primary
  },
  aiBubble: {
    backgroundColor: NeoBrutalism.surface
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  userText: {
    color: NeoBrutalism.void
  },
  aiText: {
    color: NeoBrutalism.text
  },
  timestamp: {
    fontSize: 11,
    color: NeoBrutalism.textSecondary,
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  typingContainer: {
    paddingHorizontal: 24,
    marginBottom: 8
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeoBrutalism.surface,
    borderWidth: 3,
    borderColor: NeoBrutalism.void,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    maxWidth: '75%',
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 0,
    backgroundColor: NeoBrutalism.primary,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: NeoBrutalism.void
  },
  dot1: {},
  dot2: {},
  dot3: {},
  inputContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 4,
    borderTopColor: NeoBrutalism.border,
    backgroundColor: NeoBrutalism.surface
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: NeoBrutalism.background,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: NeoBrutalism.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: NeoBrutalism.text,
    maxHeight: 100,
    paddingVertical: 8,
    fontWeight: '600'
  },
  sendButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8
  }
});