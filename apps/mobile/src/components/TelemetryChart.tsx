import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/tokens';

interface Props {
  title: string;
  data: number[];
  unit: string;
  color?: string;
  currentVal: string | number;
}

export const TelemetryChart: React.FC<Props> = ({
  title,
  data,
  unit,
  color = theme.colors.signal,
  currentVal,
}) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <Text style={[styles.value, { color }]}>
          {currentVal} <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>

      {/* Control Room Bar Readout */}
      <View style={styles.barContainer}>
        {data.map((val, i) => {
          const heightPct = Math.max(10, Math.min(100, ((val - min) / (max - min || 1)) * 100));

          return (
            <View key={i} style={styles.barCol}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${heightPct}%`,
                    backgroundColor: i === data.length - 1 ? color : `${color}60`,
                    borderColor: color,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    padding: 14,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: theme.fonts.mono,
  },
  unit: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  barContainer: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'flex-end',
    justify: 'space-between',
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justify: 'flex-end',
    marginHorizontal: 1,
  },
  barFill: {
    width: '100%',
    borderRadius: 2,
    borderWidth: 0.5,
  },
});
