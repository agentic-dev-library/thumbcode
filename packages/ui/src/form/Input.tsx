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
      className="bg-transparent border-2 border-teal-600 p-3 text-white font-body"
      style={{
        borderRadius: '0.5rem 0.625rem 0.5rem 0.75rem',
      }}
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
    />
  );
};

export default Input;
