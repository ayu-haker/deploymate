import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/tokens';

export interface Stage {
  name: 'Build' | 'Test' | 'Deploy';
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'PENDING';
  duration: string;
  logSnippet?: string;
}

interface Props {
  stages: Stage[];
}

export const FlightPathStepper: React.FC<Props> = ({ stages }) => {
  const getStageColor = (status: Stage['status']) => {
    switch (status) {
      case 'SUCCESS':
        return theme.colors.healthy;
      case 'RUNNING':
        return theme.colors.signal;
      case 'FAILED':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FLIGHT PATH TRAJECTORY</Text>

      <View style={styles.stepperRow}>
        {stages.map((stg, i) => {
          const color = getStageColor(stg.status);
          const isLast = i === stages.length - 1;
          const nextStage = stages[i + 1];

          let lineBorderColor = theme.colors.surfaceBorder;
          let lineBorderStyle: 'solid' | 'dashed' = 'solid';

          if (stg.status === 'SUCCESS') {
            lineBorderColor = theme.colors.healthy;
          }
          if (stg.status === 'FAILED' || nextStage?.status === 'FAILED') {
            lineBorderColor = theme.colors.error;
            lineBorderStyle = 'dashed';
          }

          return (
            <React.Fragment key={i}>
              <View style={styles.nodeCol}>
                <View style={[styles.outerRing, { borderColor: color, backgroundColor: `${color}15` }]}>
                  <View style={[styles.innerCore, { backgroundColor: color }]} />
                </View>
                <Text style={[styles.stageName, { color }]}>{stg.name}</Text>
                <Text style={styles.stageDuration}>{stg.duration}</Text>
                <Text style={[styles.stageStatus, { color }]}>
                  {stg.status === 'SUCCESS' ? '✓ Passed' : stg.status === 'FAILED' ? '✕ Broken' : stg.status === 'RUNNING' ? '● Live' : '○ Queued'}
                </Text>
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    {
                      borderColor: lineBorderColor,
                      borderStyle: lineBorderStyle,
                      backgroundColor: lineBorderStyle === 'solid' ? lineBorderColor : 'transparent',
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBg,
    padding: 16,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginVertical: 12,
  },
  title: {
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 16,
    fontWeight: '800',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    paddingHorizontal: 8,
  },
  nodeCol: {
    alignItems: 'center',
    width: 75,
  },
  outerRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justify: 'center',
    marginBottom: 8,
  },
  innerCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageName: {
    fontSize: 13,
    fontWeight: '800',
  },
  stageDuration: {
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stageStatus: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  connectorLine: {
    flex: 1,
    height: 3,
    borderWidth: 1,
    marginBottom: 40,
  },
});
