import React from 'react';
import { TextInput } from 'react-native';
import { styled } from 'nativewind';

const StyledTextInput = styled(TextInput);

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}

const Input = ({ value, onChangeText, placeholder, secureTextEntry = false }: InputProps) => {
  return (
    <StyledTextInput
      className="bg-transparent border-2 border-digital-teal rounded-lg p-3 text-white font-cabin"
      placeholderTextColor="#a0a0a0"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
    />
  );
};

export default Input;
