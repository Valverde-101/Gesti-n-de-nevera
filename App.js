import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, Image, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'items';

export default function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          setItems(JSON.parse(json));
        }
      } catch (e) {
        console.error('Error loading items', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(e =>
      console.error('Error saving items', e)
    );
  }, [items]);

  const renderItem = ({item}) => (
    <View style={styles.item}>
      {item.icon ? <Image source={{uri: item.icon}} style={styles.icon} /> : null}
      <Text>{`${item.name} - ${item.quantity} ${item.unit || ''}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Nevera</Text>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No hay productos</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, marginTop: 40},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 16},
  item: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8},
  icon: {width: 32, height: 32, marginRight: 8}
});
