import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GLOBAL_STYLES } from '../../styles/styles';

const Loading = () => (
  <View style={GLOBAL_STYLES.loadingContainer}>
    <ActivityIndicator size="large" />
  </View>
);

export default Loading;
