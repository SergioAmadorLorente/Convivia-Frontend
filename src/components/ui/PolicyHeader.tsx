import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import GLOBAL_STYLES from '../../styles/styles';
import { COMPONENTS } from '../../styles/theme';

interface PolicyHeaderProps {
  title: string;
  fontSize?: number;
  fontWeight?: 'bold' | '600' | 'normal';
}

const PolicyHeader: React.FC<PolicyHeaderProps> = ({
  title,
  fontSize = 14,
  fontWeight = 'bold',
}) => {
  return (
    <View style={styles.headerRow}>
      <Text style={[GLOBAL_STYLES.labelBase, { fontSize, fontWeight, color: COMPONENTS.POLICY_HEADER.leftColor }]}>
        {title}
      </Text>
      <View style={styles.lineFull} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: COMPONENTS.POLICY_HEADER.marginTop,
    marginBottom: COMPONENTS.POLICY_HEADER.marginBottom,
  },
  lineFull: {
    alignSelf: 'stretch',
    height: COMPONENTS.POLICY_HEADER.height,
    backgroundColor: COMPONENTS.POLICY_HEADER.rightColor,
    marginTop: COMPONENTS.POLICY_HEADER.gap,
  },
});

export default PolicyHeader;
