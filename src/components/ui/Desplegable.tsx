import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import GLOBAL_STYLES from '../../styles/styles';
import { COMPONENTS, FONTS } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
interface DesplegableProps {
 title: string;
 fontSize?: number;
 fontWeight?: 'bold' | '600' | 'normal';
 children?: React.ReactNode;
}
const Desplegable: React.FC<DesplegableProps> = ({
 title,
 fontSize = 14,
 fontWeight = 'bold',
 children,
}) => {
 const [isOpen, setIsOpen] = useState(false);
 const toggleOpen = () => setIsOpen(!isOpen);
 // Selección correcta de Montserrat según peso
 const appliedFont =
   fontWeight === 'bold'
     ? FONTS.bold
     : FONTS.regular;
 return (
<View style={styles.container}>
<TouchableOpacity style={styles.headerRow} onPress={toggleOpen}>
<Text
         style={[
           GLOBAL_STYLES.labelBase,
           {
             fontFamily: appliedFont,  
             fontSize,
             color: COMPONENTS?.DESPLEGABLE?.leftColor ?? '#ACBF8A',
           },
         ]}
>
         {title}
</Text>
<Ionicons
         name={isOpen ? 'chevron-up' : 'chevron-down'}
         size={20}
         color={COMPONENTS?.DESPLEGABLE?.leftColor ?? '#ACBF8A'}
       />
</TouchableOpacity>
<View style={styles.lineFull} />
     {isOpen && <View style={styles.content}>{children}</View>}
</View>
 );
};
const styles = StyleSheet.create({
 container: {
   width: '100%',
   marginTop: COMPONENTS?.DESPLEGABLE?.marginTop ?? 8,
   marginBottom: COMPONENTS?.DESPLEGABLE?.marginBottom ?? 6,
 },
 headerRow: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
 },
 lineFull: {
   alignSelf: 'stretch',
   height: COMPONENTS?.DESPLEGABLE?.height ?? 2,
   backgroundColor: COMPONENTS?.DESPLEGABLE?.rightColor ?? '#6B705C',
   marginTop: COMPONENTS?.DESPLEGABLE?.gap ?? 2,
   marginBottom: COMPONENTS?.DESPLEGABLE?.marginBottom ?? 12,
 },
 content: {
   marginTop: 10,
   paddingHorizontal: 5,
 },
});
export default Desplegable;