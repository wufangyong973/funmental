import type { RawQuestion } from './types'

export const math: RawQuestion[] = [
  // Difficulty 1
  [1, 'What is 7 × 8?', '56', '54', '64', '48', 'A handy way to remember it: 5, 6, 7, 8, so 56 = 7 × 8.'],
  [1, 'What is 15 + 27?', '42', '32', '41', '52'],
  [1, 'What is half of 150?', '75', '70', '65', '80'],
  [1, 'What is 100 − 37?', '63', '73', '67', '57'],
  [1, 'What is 9 squared?', '81', '18', '72', '99', 'Squaring a number multiplies it by itself: 9 × 9.'],
  [1, 'How many minutes are in 3 hours?', '180', '120', '300', '160'],
  [1, 'What is 12 × 12?', '144', '124', '132', '156', 'Twelve dozen is called a gross.'],
  [1, 'What is 10% of 250?', '25', '2.5', '50', '20'],
  [1, 'What is 64 ÷ 8?', '8', '6', '7', '9'],
  [1, 'How many degrees are in a right angle?', '90', '180', '45', '100'],
  [1, 'Which of these numbers is prime?', '7', '9', '15', '21', 'A prime has exactly two factors: 1 and itself.'],
  [1, 'How many sides does a pentagon have?', '5', '6', '4', '8', 'The US Department of Defense works in one.'],

  // Difficulty 2
  [2, 'What is 25% of 80?', '20', '25', '16', '40'],
  [2, 'What is the square root of 144?', '12', '14', '11', '16'],
  [2, 'The angles inside a triangle add up to how many degrees?', '180', '360', '90', '270'],
  [2, 'What is 3 cubed?', '27', '9', '18', '81', 'Cubing multiplies a number by itself twice: 3 × 3 × 3.'],
  [2, 'What is 0.5 + 0.25?', '0.75', '0.7', '0.525', '0.8'],
  [2, 'What is 17 × 3?', '51', '41', '54', '47'],
  [2, 'What is the next prime number after 13?', '17', '15', '19', '21'],
  [2, 'A $40 shirt is 25% off. What is the sale price?', '$30', '$35', '$25', '$15', '25% of $40 is $10.'],

  // Difficulty 3
  [3, 'What is 15% of 60?', '9', '6', '12', '15'],
  [3, 'What is 2 to the power of 10?', '1,024', '512', '2,048', '1,000', "It's why a kilobyte was long counted as 1,024 bytes."],
  [3, 'What is the area of a rectangle 7 cm by 6 cm?', '42 cm²', '26 cm²', '13 cm²', '48 cm²'],
  [3, 'How many sides does a dodecagon have?', '12', '10', '20', '11', '"Dodeca" is Greek for twelve.'],
  [3, 'What is 3/4 as a percentage?', '75%', '34%', '70%', '80%'],
  [3, 'The angles inside a four-sided shape add up to how many degrees?', '360', '180', '540', '720', 'Any quadrilateral splits into two triangles.'],
  [3, 'What is 13 × 7?', '91', '81', '97', '87'],
  [3, 'What is pi to two decimal places?', '3.14', '3.41', '3.12', '3.16', 'Pi Day is March 14, written 3/14.'],
  [3, 'What is the average of 4, 8 and 12?', '8', '6', '10', '12'],
  [3, 'What is 1/8 as a decimal?', '0.125', '0.8', '0.18', '0.25'],
  [3, 'How many edges does a cube have?', '12', '8', '6', '24', 'It has 8 corners and 6 faces.'],
  [3, 'What is the Roman numeral for 50?', 'L', 'C', 'D', 'V'],

  // Difficulty 4
  [4, 'What is the square root of 225?', '15', '25', '13', '17'],
  [4, 'What is 7 factorial (7!)?', '5,040', '720', '49', '40,320', '7! = 7 × 6 × 5 × 4 × 3 × 2 × 1.'],
  [4, 'What is the formula for the circumference of a circle with radius r?', '2πr', 'πr²', '4πr', 'πr/2'],
  [4, 'How many prime numbers are there between 1 and 20?', '8', '7', '9', '10', 'They are 2, 3, 5, 7, 11, 13, 17 and 19.'],
  [4, 'What is the binary number 1010 in decimal?', '10', '12', '9', '5', 'One 8 plus one 2.'],
  [4, 'What comes next in 1, 1, 2, 3, 5, 8, …?', '13', '11', '12', '16', 'Each Fibonacci number is the sum of the two before it.'],
  [4, 'What is the smallest number that both 4 and 6 divide into?', '12', '24', '2', '10'],
  [4, 'A right triangle has legs of 3 and 4. How long is the hypotenuse?', '5', '6', '7', '4.5', 'By Pythagoras: 3² + 4² = 5².'],

  // Difficulty 5
  [5, 'What is the sum of the whole numbers from 1 to 100?', '5,050', '5,000', '10,000', '4,950', 'Legend says Gauss worked it out as a schoolboy: 50 pairs that each make 101.'],
  [5, 'How many zeros are in one billion?', '9', '6', '12', '8'],
  [5, 'What is the only even prime number?', '2', '4', '0', '6'],
  [5, "Who proved Fermat's Last Theorem in the 1990s?", 'Andrew Wiles', 'Pierre de Fermat', 'Leonhard Euler', 'Kurt Gödel', 'Fermat claimed a proof in a margin in 1637; Wiles finished one in 1994.'],
  [5, 'What is 0! (zero factorial)?', '1', '0', 'Undefined', 'Infinity', 'There is exactly one way to arrange nothing.'],
  [5, 'How many faces does an icosahedron have?', '20', '12', '30', '8', 'It is the shape of a classic d20 die.'],
  [5, 'What is the square root of 2 to three decimal places?', '1.414', '1.732', '1.141', '1.441'],
  [5, "What is Euler's number e to two decimal places?", '2.72', '3.14', '1.62', '2.27'],
]
