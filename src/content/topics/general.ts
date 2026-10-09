import type { RawQuestion } from './types'

export const general: RawQuestion[] = [
  // Difficulty 1
  [1, 'How many days are in a leap year?', '366', '365', '364', '367', 'The extra day, February 29, keeps the calendar in step with the seasons.'],
  [1, 'How many sides does a hexagon have?', '6', '5', '7', '8', 'Honeybees build their comb cells as hexagons.'],
  [1, 'Who painted the Mona Lisa?', 'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Vincent van Gogh', 'It hangs in the Louvre in Paris behind protective glass.'],
  [1, 'Who wrote Romeo and Juliet?', 'William Shakespeare', 'Charles Dickens', 'Christopher Marlowe', 'Geoffrey Chaucer', 'The play is set in the Italian city of Verona.'],
  [1, 'Which Greek god ruled as king of the gods on Mount Olympus?', 'Zeus', 'Poseidon', 'Hades', 'Apollo', 'His signature weapon was the thunderbolt.'],
  [1, 'How many letters are in the English alphabet?', '26', '24', '25', '28', 'Five of them are standard vowels: A, E, I, O and U.'],
  [1, 'Who is credited with patenting the telephone in 1876?', 'Alexander Graham Bell', 'Thomas Edison', 'Nikola Tesla', 'Guglielmo Marconi', 'His first words on it were reportedly to his assistant, Mr. Watson.'],
  [1, 'What color do you get by mixing blue and yellow paint?', 'Green', 'Purple', 'Orange', 'Brown'],
  [1, 'In which board game do you try to checkmate the king?', 'Chess', 'Checkers', 'Backgammon', 'Go', '"Checkmate" comes from the Persian "shah mat", roughly "the king is helpless".'],
  [1, 'Which fairy tale heroine leaves a glass slipper behind at a ball?', 'Cinderella', 'Snow White', 'Rapunzel', 'Sleeping Beauty', 'She must leave before the magic ends at midnight.'],
  [1, 'Which fictional detective lived at 221B Baker Street?', 'Sherlock Holmes', 'Hercule Poirot', 'Sam Spade', 'Philip Marlowe', 'He was created by Sir Arthur Conan Doyle.'],
  [1, 'How many years are in a century?', '100', '10', '1,000', '50', 'A thousand years is a millennium.'],

  // Difficulty 2
  [2, 'How many hours are in a week?', '168', '144', '172', '186', 'That is 7 days times 24 hours.'],
  [2, 'Who wrote the novel 1984?', 'George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'H. G. Wells', 'It gave us the phrase "Big Brother is watching you".'],
  [2, 'Who painted The Starry Night?', 'Vincent van Gogh', 'Claude Monet', 'Paul Cézanne', 'Edvard Munch', 'He painted it in 1889 from his room at an asylum in Saint-Rémy.'],
  [2, 'Who invented the World Wide Web?', 'Tim Berners-Lee', 'Bill Gates', 'Steve Jobs', 'Vint Cerf', 'He proposed it in 1989 while working at CERN.'],
  [2, 'What is a word or phrase that reads the same forwards and backwards?', 'Palindrome', 'Anagram', 'Acronym', 'Oxymoron', '"Racecar" and "level" are classic examples.'],
  [2, 'In Greek myth, who opened a jar that released evils into the world?', 'Pandora', 'Persephone', 'Medusa', 'Athena', 'Only hope remained inside once she closed it.'],
  [2, 'Who wrote Pride and Prejudice?', 'Jane Austen', 'Charlotte Brontë', 'Emily Brontë', 'Mary Shelley', 'It was published in 1813 and features Elizabeth Bennet and Mr. Darcy.'],
  [2, 'A golden wedding anniversary marks how many years?', '50', '25', '40', '60', 'Twenty-five years is a silver anniversary.'],

  // Difficulty 3
  [3, 'Who was the Roman god of war?', 'Mars', 'Jupiter', 'Mercury', 'Neptune', 'The month of March is named after him.'],
  [3, 'Which Greek hero slew the Minotaur in the labyrinth?', 'Theseus', 'Perseus', 'Heracles', 'Jason', 'Ariadne gave him a thread to find his way back out.'],
  [3, 'Who painted the ceiling of the Sistine Chapel?', 'Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Sandro Botticelli', 'He worked on it from 1508 to 1512.'],
  [3, 'Who wrote One Hundred Years of Solitude?', 'Gabriel García Márquez', 'Jorge Luis Borges', 'Mario Vargas Llosa', 'Isabel Allende', 'It follows the Buendía family in the fictional town of Macondo.'],
  [3, 'What is the Roman numeral for 500?', 'D', 'L', 'C', 'M', 'L is 50, C is 100 and M is 1,000.'],
  [3, 'Which Latin phrase does "e.g." abbreviate?', 'Exempli gratia', 'Id est', 'Et cetera', 'Ergo sum', 'It means "for the sake of example".'],
  [3, 'Who introduced movable-type printing to Europe around 1440?', 'Johannes Gutenberg', 'William Caxton', 'Martin Luther', 'Aldus Manutius', 'His most famous printed work is the Gutenberg Bible.'],
  [3, 'In Norse mythology, what is the name of Thor\'s hammer?', 'Mjölnir', 'Gungnir', 'Draupnir', 'Gjallarhorn', 'Gungnir is the spear of Odin, Thor\'s father.'],
  [3, 'Who wrote Moby-Dick?', 'Herman Melville', 'Nathaniel Hawthorne', 'Mark Twain', 'Jack London', 'It opens with the line "Call me Ishmael."'],
  [3, 'What is the collective noun for a group of crows?', 'A murder', 'A parliament', 'A pride', 'A gaggle', 'A parliament is owls, a pride is lions, and a gaggle is geese.'],
  [3, 'How many lines does a traditional sonnet have?', '14', '12', '10', '16', 'Shakespeare wrote 154 of them.'],
  [3, 'Which artist painted the melting clocks of The Persistence of Memory?', 'Salvador Dalí', 'René Magritte', 'Joan Miró', 'Pablo Picasso', 'The small 1931 canvas is in New York\'s Museum of Modern Art.'],

  // Difficulty 4
  [4, 'Which Titan was punished for stealing fire and giving it to humans?', 'Prometheus', 'Atlas', 'Cronus', 'Epimetheus', 'An eagle ate his liver daily, and it grew back each night.'],
  [4, 'Who painted The Garden of Earthly Delights?', 'Hieronymus Bosch', 'Pieter Bruegel the Elder', 'Jan van Eyck', 'Albrecht Dürer', 'The strange triptych hangs in Madrid\'s Prado Museum.'],
  [4, 'Which term describes paired contradictory words, like "deafening silence"?', 'Oxymoron', 'Paradox', 'Hyperbole', 'Litotes', 'The word itself comes from Greek for "sharp-dull".'],
  [4, 'Who wrote Don Quixote?', 'Miguel de Cervantes', 'Lope de Vega', 'Federico García Lorca', 'Pedro Calderón de la Barca', 'Its first part appeared in 1605.'],
  [4, 'From which language does the word "kindergarten" come?', 'German', 'Dutch', 'Danish', 'Swedish', 'It literally means "children\'s garden".'],
  [4, 'Which symbol is also known as the octothorpe?', 'Hash sign (#)', 'Asterisk (*)', 'Ampersand (&)', 'At sign (@)', 'It was named by Bell Labs engineers for telephone keypads.'],
  [4, 'Which Scottish inventor first publicly demonstrated television in 1926?', 'John Logie Baird', 'Philo Farnsworth', 'Alexander Graham Bell', 'James Watt', 'His early system used a mechanical spinning disc.'],
  [4, 'Which jackal-headed Egyptian god was linked to mummification?', 'Anubis', 'Horus', 'Thoth', 'Sobek', 'Horus had a falcon head, Thoth an ibis head, and Sobek a crocodile head.'],

  // Difficulty 5
  [5, 'What is the name of the dot over a lowercase "i" or "j"?', 'Tittle', 'Serif', 'Macron', 'Cedilla', 'It may be the origin of the phrase "to a T", from "to a tittle".'],
  [5, 'Who painted The Arnolfini Portrait in 1434?', 'Jan van Eyck', 'Rogier van der Weyden', 'Hans Holbein the Younger', 'Robert Campin', 'A convex mirror in the painting reflects two extra figures.'],
  [5, 'Which of the nine Muses presided over epic poetry?', 'Calliope', 'Clio', 'Erato', 'Thalia', 'Clio was the Muse of history, Erato of love poetry, and Thalia of comedy.'],
  [5, 'What is a word that can mean its own opposite, like "cleave"?', 'Contronym', 'Heteronym', 'Retronym', 'Antonym', '"Cleave" can mean both to split apart and to cling together.'],
  [5, 'Which Russian author wrote the novel Dead Souls?', 'Nikolai Gogol', 'Ivan Turgenev', 'Anton Chekhov', 'Leo Tolstoy', 'Gogol burned much of its unfinished second part shortly before his death.'],
  [5, 'Who made the first mercury thermometer in 1714, then devised a temperature scale?', 'Daniel Gabriel Fahrenheit', 'Anders Celsius', 'Lord Kelvin', 'René Réaumur', 'Celsius proposed his own scale later, in 1742.'],
  [5, 'A sesquicentennial celebrates how many years?', '150 years', '125 years', '175 years', '200 years', 'The Latin prefix "sesqui" means one and a half.'],
  [5, 'In Malory\'s Arthurian legend, who returns Excalibur to the lake?', 'Sir Bedivere', 'Sir Lancelot', 'Sir Gawain', 'Sir Galahad', 'He twice hid the sword before finally obeying the dying King Arthur.'],
]
