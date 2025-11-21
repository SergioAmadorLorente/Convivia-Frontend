import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import GLOBAL_STYLES from '../../styles/styles';

const Loading: React.FC = () => (
  <View style={GLOBAL_STYLES.loadingContainer}>
    <ActivityIndicator size="large" />
  </View>
);

export default Loading;
