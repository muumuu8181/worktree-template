function calculate(expression) {
  try {
    const parts = expression.trim().split(' ');
    
    if (parts.length !== 3) {
      return "Invalid format";
    }
    
    const num1 = parseFloat(parts[0]);
    const operator = parts[1];
    const num2 = parseFloat(parts[2]);
    
    if (isNaN(num1) || isNaN(num2)) {
      return "Invalid input";
    }
    
    switch (operator) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '*':
        return num1 * num2;
      case '/':
        if (num2 === 0) {
          return "Error: Division by zero";
        }
        return num1 / num2;
      default:
        return "Invalid operator";
    }
  } catch (error) {
    return "Invalid input";
  }
}

export { calculate };