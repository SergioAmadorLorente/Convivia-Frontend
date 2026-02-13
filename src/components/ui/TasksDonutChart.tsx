import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, COMMON } from '../../styles/theme';

interface TasksDonutChartProps {
  completedTasks: number;
  lateTasks: number;
  size?: number; // Tamaño del gráfico (por defecto 200)
}

const TasksDonutChart: React.FC<TasksDonutChartProps> = ({
  completedTasks,
  lateTasks,
  size = 200,
}) => {
  const totalTasks = completedTasks + lateTasks;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  const completedPercentage = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const latePercentage = totalTasks > 0 ? lateTasks / totalTasks : 0;

  const completedLength = circumference * completedPercentage;
  const lateLength = circumference * latePercentage;

  return (
    <View style={styles.chartContainer}>
      {totalTasks > 0 ? (
        <>
          <Svg height={size} width={size} viewBox="0 0 120 120">
            {/* Círculo base (gris claro) */}
            <Circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#E0E0E0"
              strokeWidth="18"
              fill="none"
            />

            {/* Segmento de tareas completadas (verde) */}
            {completedTasks > 0 && (
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke={COLORS.accent}
                strokeWidth="18"
                fill="none"
                strokeDasharray={`${completedLength} ${circumference}`}
                strokeDashoffset="0"
                rotation="-90"
                origin="60, 60"
              />
            )}

            {/* Segmento de tareas fuera de plazo (rojo) */}
            {lateTasks > 0 && (
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke={COLORS.primary}
                strokeWidth="18"
                fill="none"
                strokeDasharray={`${lateLength} ${circumference}`}
                strokeDashoffset={-completedLength}
                rotation="-90"
                origin="60, 60"
              />
            )}

            {/* Total en el centro */}
            <SvgText
              x="60"
              y="60"
              fontSize="16"
              fontWeight="bold"
              fill="#4B4741"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {totalTasks}
            </SvgText>
          </Svg>

          {/* Leyenda */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.legendText}>Completadas</Text>
              <Text style={styles.legendValue}>{completedTasks}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Fuera de plazo</Text>
              <Text style={styles.legendValue}>{lateTasks}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyChartContainer}>
          <Ionicons name="pie-chart-outline" size={60} color="#CCC" />
          <Text style={styles.emptyChartText}>No hay tareas registradas</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: COLORS.secondary,
    flex: 1,
  },
  legendValue: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.text14,
    color: COLORS.secondary,
  },
  emptyChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: '#999',
    marginTop: 10,
  },
});

export default TasksDonutChart;
