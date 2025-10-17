import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import colors from '../CommonFiles/Colors';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = ({title, imageSource, onMenuPress}) => {
  return (
    <View
      style={{
        backgroundColor: colors.Brown,
        padding: 15,
        justifyContent: 'center',

        alignItems: 'center',
        flexDirection: 'row',
      }}>
      <TouchableOpacity
        onPress={onMenuPress}
        style={{position: 'absolute', left: 15, top: 15}}>
        {' '}
        <Icon name="menu" size={30} color="white" />
      </TouchableOpacity>

      {imageSource && (
        <Image
          source={imageSource}
          style={{
            width: 30,
            height: 30,
            marginRight: 10,
            borderRadius: 50,
          }}
        />
      )}
      <Text
        style={{
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'Inter-Bold',
        }}>
        {title}
      </Text>
    </View>
  );
};

export default Header;
