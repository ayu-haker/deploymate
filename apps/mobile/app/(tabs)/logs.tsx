import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { theme } from '../../src/theme/tokens';
import { MOCK_LOGS, LogLine } from '../../src/data/mockData';

export default function LogsScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showJumpToLive, setShowJumpToLive] = useState(false);

  const filteredLogs = MOCK_LOGS.filter(l => {
    const matchesSev = severityFilter === 'ALL' || l.severity === severityFilter;
    const matchesQuery = searchQuery === '' || l.message.toLowerCase().includes(searchQuery.toLowerCase()) || l.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesQuery;
  });

  const getSeverityColor = (sev: LogLine['severity']) => {
    switch (sev) {
      case 'ERROR':
        return theme.colors.error;
      case 'WARN':
        return theme.colors.warning;
      case 'INFO':
        return theme.colors.signal;
      case 'DEBUG':
        return '#c084fc';
      default:
        return theme.colors.textSecondary;
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setShowJumpToLive(false);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    if (contentHeight - offsetY - layoutHeight > 80) {
      setShowJumpToLive(true);
    } else {
      setShowJumpToLive(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Stream Indicator Bar */}
      <View style={styles.topStreamBar}>
        <View style={styles.liveIndicator}>
          <View style={styles.livePulseDot} />
          <Text style={styles.liveStreamText}>● LIVE LOG STREAM (WSS CONNECTED)</Text>
        </View>
        <Text style={styles.logCountText}>{filteredLogs.length} Lines</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter log messages, stack traces or services..."
          placeholderTextColor="rgba(245, 246, 250, 0.4)"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontally Scrollable Severity Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
        {(['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const).map(sev => {
          const isActive = severityFilter === sev;
          const chipColor = sev === 'ALL' ? theme.colors.signal : getSeverityColor(sev);

          return (
            <TouchableOpacity
              key={sev}
              style={[
                styles.chip,
                isActive && { backgroundColor: chipColor, borderColor: chipColor }
              ]}
              onPress={() => setSeverityFilter(sev)}
            >
              <Text style={[styles.chipText, isActive && { color: '#000', fontWeight: '900' }]}>
                {sev}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Live Monospace Log Stream */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.logStreamContainer}
        contentContainerStyle={{ paddingBottom: 60 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateText}>No logs match these filters.</Text>
            <Text style={styles.emptyStateSub}>Try widening the search term or severity filter range.</Text>
          </View>
        ) : (
          filteredLogs.map(log => {
            const color = getSeverityColor(log.severity);
            const isExpanded = expandedLogId === log.id;

            return (
              <TouchableOpacity
                key={log.id}
                style={[styles.logRow, isExpanded && styles.logRowExpanded]}
                onPress={() => setExpandedLogId(isExpanded ? null : log.id)}
              >
                <View style={styles.logLineHeader}>
                  <Text style={styles.timestamp}>{log.timestamp}</Text>
                  <Text style={[styles.severityBadge, { color }]}>[{log.severity}]</Text>
                  <Text style={styles.serviceTag}>{log.service}</Text>
                </View>

                <Text style={[styles.logMessage, { color: log.severity === 'ERROR' ? theme.colors.error : theme.colors.textPrimary }]}>
                  {log.message}
                </Text>

                {/* Expanded Stack Trace & Metadata */}
                {isExpanded && log.metadata && (
                  <View style={styles.metadataBox}>
                    <Text style={styles.metadataTitle}>STRUCTURED METADATA & STACK TRACE:</Text>
                    <Text style={styles.metadataJson}>
                      {JSON.stringify(log.metadata, null, 2)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Jump to Live Floating Pill */}
      {showJumpToLive && (
        <TouchableOpacity style={styles.jumpToLivePill} onPress={scrollToBottom}>
          <Text style={styles.jumpToLiveText}>↓ Jump to Live Log Stream</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  topStreamBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.healthy,
    marginRight: 8,
  },
  liveStreamText: {
    fontSize: 10,
    fontFamily: theme.fonts.mono,
    color: theme.colors.healthy,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logCountText: {
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    paddingHorizontal: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: theme.fonts.mono,
  },
  clearIcon: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    padding: 4,
  },
  filterChipScroll: {
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surfaceFill,
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  logStreamContainer: {
    flex: 1,
    backgroundColor: '#030508',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 10,
  },
  logRow: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logRowExpanded: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: theme.radii.sm,
  },
  logLineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textMuted,
    marginRight: 8,
  },
  severityBadge: {
    fontSize: 10,
    fontFamily: theme.fonts.mono,
    fontWeight: '900',
    marginRight: 8,
  },
  serviceTag: {
    fontSize: 10,
    fontFamily: theme.fonts.mono,
    color: theme.colors.signal,
  },
  logMessage: {
    fontSize: 12,
    fontFamily: theme.fonts.mono,
    lineHeight: 18,
  },
  metadataBox: {
    backgroundColor: theme.colors.cardBg,
    padding: 10,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginTop: 8,
  },
  metadataTitle: {
    fontSize: 10,
    fontFamily: theme.fonts.mono,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '800',
  },
  metadataJson: {
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    color: theme.colors.healthy,
  },
  emptyStateBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  jumpToLivePill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: theme.colors.signal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radii.pill,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  jumpToLiveText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
});
