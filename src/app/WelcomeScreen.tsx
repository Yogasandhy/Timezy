import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../shared/theme/tokens';
import { PrimaryButton } from '../shared/components/PrimaryButton';
import { QuietStepsMark } from '../shared/components/QuietStepsMark';
import { Surface } from '../shared/components/Surface';

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <QuietStepsMark size={44} />
          <Text style={styles.brandName}>Timezy</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.sun} />
          <Surface style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.avatar}><Text style={styles.avatarFace}>☺</Text></View>
              <View style={styles.speech}><Text style={styles.speechText}>One step at a time.</Text></View>
            </View>
            <View style={styles.laptop}>
              <View style={styles.laptopScreen}><QuietStepsMark size={38} color={colors.surface} /></View>
              <View style={styles.laptopBase} />
            </View>
            <View style={styles.taskPreview}>
              <View style={styles.previewCheck}><Text style={styles.previewCheckText}>✓</Text></View>
              <View style={styles.previewLines}><View style={styles.previewLine} /><View style={styles.previewLineShort} /></View>
              <Text style={styles.previewTime}>09:30</Text>
            </View>
            <View style={[styles.taskPreview, styles.previewSecond]}>
              <View style={[styles.previewCheck, styles.previewCheckSoft]} />
              <View style={styles.previewLines}><View style={styles.previewLine} /><View style={styles.previewLineShort} /></View>
              <Text style={styles.previewTime}>13:00</Text>
            </View>
          </Surface>
        </View>
        <View style={styles.copy}>
          <Text style={styles.headline}>Plan gently.{ '\n' }Move forward.</Text>
          <Text style={styles.description}>Make space for what matters today, one quiet step at a time.</Text>
        </View>
        <PrimaryButton label="Let's begin" onPress={onStart} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, justifyContent: 'center' },
  brandName: { fontSize: 26, fontWeight: '800', color: colors.primary, letterSpacing: -0.7 },
  hero: { flex: 1, minHeight: 250, maxHeight: 400, justifyContent: 'center', marginVertical: spacing.md },
  sun: { width: 38, height: 38, borderRadius: radii.pill, backgroundColor: '#E5C84A', position: 'absolute', right: '18%', top: '9%' },
  heroCard: { alignSelf: 'center', width: '84%', maxWidth: 340, padding: spacing.xl, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 95 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#D5B8A2', borderWidth: 7, borderColor: '#E8D6C8', alignItems: 'center', justifyContent: 'center' },
  avatarFace: { color: '#573F33', fontSize: 40, fontWeight: '600' },
  speech: { backgroundColor: colors.primarySoft, borderRadius: 15, paddingVertical: 8, paddingHorizontal: 11, marginLeft: -8, alignSelf: 'flex-start', marginTop: 5 },
  speechText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  laptop: { alignItems: 'center', marginTop: spacing.md },
  laptopScreen: { width: '80%', height: 70, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#56615B', alignItems: 'center', justifyContent: 'center' },
  laptopBase: { width: '94%', height: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#929C93' },
  taskPreview: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, padding: spacing.sm, borderRadius: radii.md, backgroundColor: '#EDF4E9', gap: spacing.sm },
  previewCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  previewCheckText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  previewCheckSoft: { backgroundColor: '#BDD1B9' },
  previewLines: { flex: 1, gap: 4 },
  previewLine: { height: 5, width: '72%', borderRadius: 4, backgroundColor: '#829080' },
  previewLineShort: { height: 4, width: '42%', borderRadius: 4, backgroundColor: '#C1CABD' },
  previewTime: { color: colors.textSecondary, fontSize: 10 },
  previewSecond: { backgroundColor: '#F4F4EA' },
  copy: { marginBottom: spacing.xl },
  headline: { color: colors.textPrimary, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.7 },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: spacing.md, maxWidth: 340 },
});
