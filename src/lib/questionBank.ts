export interface Question {
  id: string;
  domain: string;
  topic: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export const questionBank: Question[] = [
  // APTITUDE
  // Problems on Trains
  { id: 'apt1', domain: 'aptitude', topic: 'Problems on Trains', text: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: ["120 metres", "180 metres", "324 metres", "150 metres"], correctAnswer: "150 metres" },
  { id: 'apt2', domain: 'aptitude', topic: 'Problems on Trains', text: "A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. The speed of the train is:", options: ["45 km/hr", "50 km/hr", "54 km/hr", "55 km/hr"], correctAnswer: "50 km/hr" },
  { id: 'apt3', domain: 'aptitude', topic: 'Problems on Trains', text: "The length of the bridge, which a train 130 metres long and travelling at 45 km/hr can cross in 30 seconds, is:", options: ["200 m", "225 m", "245 m", "250 m"], correctAnswer: "245 m" },
  { id: 'apt4', domain: 'aptitude', topic: 'Problems on Trains', text: "Two trains running in opposite directions cross a man standing on the platform in 27 seconds and 17 seconds respectively and they cross each other in 23 seconds. The ratio of their speeds is:", options: ["1:3", "3:2", "3:4", "None of these"], correctAnswer: "3:2" },
  { id: 'apt5', domain: 'aptitude', topic: 'Problems on Trains', text: "A train passes a station platform in 36 seconds and a man standing on the platform in 20 seconds. If the speed of the train is 54 km/hr, what is the length of the platform?", options: ["120 m", "240 m", "300 m", "None of these"], correctAnswer: "240 m" },
  { id: 'apt6', domain: 'aptitude', topic: 'Problems on Trains', text: "A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?", options: ["65 sec", "89 sec", "100 sec", "150 sec"], correctAnswer: "89 sec" },
  { id: 'apt7', domain: 'aptitude', topic: 'Problems on Trains', text: "Two trains of equal length are running on parallel lines in the same direction at 46 km/hr and 36 km/hr. The faster train passes the slower train in 36 seconds. The length of each train is:", options: ["50 m", "72 m", "80 m", "82 m"], correctAnswer: "50 m" },
  // Time and Work
  { id: 'apt8', domain: 'aptitude', topic: 'Time and Work', text: "A completes a work in 12 days and B completes the same work in 24 days. If they work together, in how many days will the work be completed?", options: ["8 days", "6 days", "10 days", "12 days"], correctAnswer: "8 days" },
  { id: 'apt9', domain: 'aptitude', topic: 'Time and Work', text: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is :", options: ["1/4", "1/10", "7/15", "8/15"], correctAnswer: "8/15" },
  { id: 'apt10', domain: 'aptitude', topic: 'Time and Work', text: "A alone can do a piece of work in 6 days and B alone in 8 days. A and B undertook to do it for Rs. 3200. With the help of C, they completed the work in 3 days. How much is to be paid to C?", options: ["Rs. 375", "Rs. 400", "Rs. 600", "Rs. 800"], correctAnswer: "Rs. 400" },
  { id: 'apt11', domain: 'aptitude', topic: 'Time and Work', text: "A is thrice as good as workman as B and therefore is able to finish a job in 60 days less than B. Working together, they can do it in:", options: ["20 days", "22.5 days", "25 days", "30 days"], correctAnswer: "22.5 days" },
  { id: 'apt12', domain: 'aptitude', topic: 'Time and Work', text: "A can do a certain work in the same time in which B and C together can do it. If A and B together could do it in 10 days and C alone in 50 days, then B alone could do it in:", options: ["15 days", "20 days", "25 days", "30 days"], correctAnswer: "25 days" },
  { id: 'apt13', domain: 'aptitude', topic: 'Time and Work', text: "Machine P can print one lakh books in 8 hours, machine Q can print the same number of books in 10 hours while machine R can print them in 12 hours. All the machines are started at 9 A.M. while machine P is closed at 11 A.M. and the remaining two machines complete work. Approximately at what time will the work (to print one lakh books) be finished?", options: ["11:30 A.M.", "12 noon", "12:30 P.M.", "1:00 P.M."], correctAnswer: "1:00 P.M." },
  // Profit and Loss
  { id: 'apt14', domain: 'aptitude', topic: 'Profit and Loss', text: "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:", options: ["15", "16", "18", "25"], correctAnswer: "16" },
  { id: 'apt15', domain: 'aptitude', topic: 'Profit and Loss', text: "A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?", options: ["3", "4", "5", "6"], correctAnswer: "5" },
  { id: 'apt16', domain: 'aptitude', topic: 'Profit and Loss', text: "If selling price is doubled, the profit triples. Find the profit percent.", options: ["66.66", "100", "105", "120"], correctAnswer: "100" },
  { id: 'apt17', domain: 'aptitude', topic: 'Profit and Loss', text: "In a certain store, the profit is 320% of the cost. If the cost increases by 25% but the selling price remains constant, approximately what percentage of the selling price is the profit?", options: ["30%", "70%", "100%", "250%"], correctAnswer: "70%" },
  { id: 'apt18', domain: 'aptitude', topic: 'Profit and Loss', text: "A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price of the cycle?", options: ["Rs. 1090", "Rs. 1160", "Rs. 1190", "Rs. 1202"], correctAnswer: "Rs. 1190" },
  { id: 'apt19', domain: 'aptitude', topic: 'Profit and Loss', text: "Sam purchased 20 dozens of toys at the rate of Rs. 375 per dozen. He sold each one of them at the rate of Rs. 33. What was his percentage profit?", options: ["3.5", "4.5", "5.6", "6.5"], correctAnswer: "5.6" },
  { id: 'apt20', domain: 'aptitude', topic: 'Problems on Trains', text: "Two trains are moving in opposite directions @ 60 km/hr and 90 km/hr. Their lengths are 1.10 km and 0.9 km respectively. The time taken by the slower train to cross the faster train in seconds is:", options: ["36", "45", "48", "58"], correctAnswer: "48" },

  // LOGICAL
  // Number Series
  { id: 'log1', domain: 'logical', topic: 'Number Series', text: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", options: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"], correctAnswer: "(1/8)" },
  { id: 'log2', domain: 'logical', topic: 'Number Series', text: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", options: ["7", "10", "12", "13"], correctAnswer: "10" },
  { id: 'log3', domain: 'logical', topic: 'Number Series', text: "Look at this series: 36, 34, 30, 28, 24, ... What number should come next?", options: ["20", "22", "23", "26"], correctAnswer: "22" },
  { id: 'log4', domain: 'logical', topic: 'Number Series', text: "Look at this series: 22, 21, 23, 22, 24, 23, ... What number should come next?", options: ["22", "24", "25", "26"], correctAnswer: "25" },
  { id: 'log5', domain: 'logical', topic: 'Number Series', text: "Look at this series: 53, 53, 40, 40, 27, 27, ... What number should come next?", options: ["12", "14", "27", "53"], correctAnswer: "14" },
  { id: 'log6', domain: 'logical', topic: 'Number Series', text: "Look at this series: 2, 6, 18, 54, ... What number should come next?", options: ["108", "148", "162", "216"], correctAnswer: "162" },
  { id: 'log7', domain: 'logical', topic: 'Number Series', text: "Look at this series: 8, 22, 8, 28, 8, ... What number should come next?", options: ["9", "29", "32", "34"], correctAnswer: "34" },
  // Analogies
  { id: 'log8', domain: 'logical', topic: 'Analogies', text: "Odometer is to mileage as compass is to:", options: ["speed", "hiking", "needle", "direction"], correctAnswer: "direction" },
  { id: 'log9', domain: 'logical', topic: 'Analogies', text: "Marathon is to race as hibernation is to:", options: ["winter", "bear", "dream", "sleep"], correctAnswer: "sleep" },
  { id: 'log10', domain: 'logical', topic: 'Analogies', text: "Window is to pane as book is to:", options: ["novel", "glass", "cover", "page"], correctAnswer: "page" },
  { id: 'log11', domain: 'logical', topic: 'Analogies', text: "Cup is to coffee as bowl is to:", options: ["dish", "soup", "spoon", "food"], correctAnswer: "soup" },
  { id: 'log12', domain: 'logical', topic: 'Analogies', text: "Yard is to inch as quart is to:", options: ["gallon", "ounce", "milk", "liquid"], correctAnswer: "ounce" },
  { id: 'log13', domain: 'logical', topic: 'Analogies', text: "Reptile is to lizard as flower is to:", options: ["petal", "stem", "daisy", "alligator"], correctAnswer: "daisy" },
  // Blood Relations
  { id: 'log14', domain: 'logical', topic: 'Blood Relations', text: "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?", options: ["Brother", "Uncle", "Cousin", "Father"], correctAnswer: "Father" },
  { id: 'log15', domain: 'logical', topic: 'Blood Relations', text: "If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?", options: ["Brother", "Sister", "Nephew", "Cannot be determined"], correctAnswer: "Cannot be determined" },
  { id: 'log16', domain: 'logical', topic: 'Blood Relations', text: "A is B's sister. C is B's mother. D is C's father. E is D's mother. Then, how is A related to D?", options: ["Grandfather", "Grandmother", "Daughter", "Granddaughter"], correctAnswer: "Granddaughter" },
  { id: 'log17', domain: 'logical', topic: 'Blood Relations', text: "Pointing to a lady, a man said, 'The son of her only brother is the brother of my wife.' How is the lady related to the man's wife?", options: ["Mother", "Aunt", "Sister", "Mother-in-law"], correctAnswer: "Aunt" },
  { id: 'log18', domain: 'logical', topic: 'Blood Relations', text: "A girl introduced a boy as the son of the daughter of the father of her uncle. The boy is girl's:", options: ["Brother", "Son", "Uncle", "Son-in-law"], correctAnswer: "Brother" },
  { id: 'log19', domain: 'logical', topic: 'Blood Relations', text: "If A + B means A is the brother of B; A - B means A is the sister of B and A x B means A is the father of B. Which of the following means that C is the son of M?", options: ["M - N x C + F", "F - C + N x M", "N + M - F x C", "M x N - C + F"], correctAnswer: "M x N - C + F" },
  { id: 'log20', domain: 'logical', topic: 'Blood Relations', text: "Pointing to a gentleman, Deepak said, 'His only brother is the father of my daughter's father.' How is the gentleman related to Deepak?", options: ["Grandfather", "Father", "Brother-in-law", "Uncle"], correctAnswer: "Uncle" },

  // JAVA
  // OOPS
  { id: 'jav1', domain: 'java', topic: 'OOPS', text: "Which of the following is not an OOPS concept in Java?", options: ["Polymorphism", "Inheritance", "Compilation", "Encapsulation"], correctAnswer: "Compilation" },
  { id: 'jav2', domain: 'java', topic: 'OOPS', text: "Which concept allows you to reuse the written code?", options: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"], correctAnswer: "Inheritance" },
  { id: 'jav3', domain: 'java', topic: 'OOPS', text: "Which feature of OOPS described the reusability of code?", options: ["Abstraction", "Encapsulation", "Polymorphism", "Inheritance"], correctAnswer: "Inheritance" },
  { id: 'jav4', domain: 'java', topic: 'OOPS', text: "How can we implement multiple inheritance in Java?", options: ["Using abstract classes", "Using interfaces", "Using concrete classes", "It is not possible at all"], correctAnswer: "Using interfaces" },
  { id: 'jav5', domain: 'java', topic: 'OOPS', text: "What is encapsulation in Java?", options: ["Hiding unnecessary data", "Binding code and data together into a single unit", "Creating multiple methods with the same name", "Deriving a class from another class"], correctAnswer: "Binding code and data together into a single unit" },
  { id: 'jav6', domain: 'java', topic: 'OOPS', text: "Which of the following describes method overloading?", options: ["Methods with same name but different parameters", "Methods with same name and same parameters", "Overriding a method in subclass", "Hiding method implementation"], correctAnswer: "Methods with same name but different parameters" },
  { id: 'jav7', domain: 'java', topic: 'OOPS', text: "A class that cannot be instantiated is called?", options: ["Final class", "Abstract class", "Static class", "Anonymous class"], correctAnswer: "Abstract class" },
  // Exception Handling
  { id: 'jav8', domain: 'java', topic: 'Exception Handling', text: "Which keyword is used to explicitly throw an exception?", options: ["catch", "try", "throw", "throws"], correctAnswer: "throw" },
  { id: 'jav9', domain: 'java', topic: 'Exception Handling', text: "What is the base class for all exceptions and errors in Java?", options: ["Error", "Exception", "Throwable", "RuntimeException"], correctAnswer: "Throwable" },
  { id: 'jav10', domain: 'java', topic: 'Exception Handling', text: "When does the finally block get executed?", options: ["Only when exception occurs", "Only when exception does not occur", "Always, regardless of exception", "Never"], correctAnswer: "Always, regardless of exception" },
  { id: 'jav11', domain: 'java', topic: 'Exception Handling', text: "Which of the following exceptions is checked by the compiler?", options: ["ArithmeticException", "NullPointerException", "IOException", "ArrayIndexOutOfBoundsException"], correctAnswer: "IOException" },
  { id: 'jav12', domain: 'java', topic: 'Exception Handling', text: "Can you have a try block without a catch block?", options: ["Yes, if there is a finally block", "No, it must have a catch block", "Yes, it can be standalone", "Yes, but it won't compile"], correctAnswer: "Yes, if there is a finally block" },
  { id: 'jav13', domain: 'java', topic: 'Exception Handling', text: "Which of these keywords must be used to handle the exception thrown by try block in some other part of program?", options: ["catch", "throw", "throws", "finally"], correctAnswer: "catch" },
  // Threads
  { id: 'jav14', domain: 'java', topic: 'Threads', text: "Which of these classes is used to make a thread?", options: ["String", "System", "Thread", "Runnable"], correctAnswer: "Thread" },
  { id: 'jav15', domain: 'java', topic: 'Threads', text: "Which interface should be implemented to create a thread?", options: ["Thread", "Runnable", "Cloneable", "Serializable"], correctAnswer: "Runnable" },
  { id: 'jav16', domain: 'java', topic: 'Threads', text: "What method must be implemented by all threads created using Runnable?", options: ["start()", "run()", "execute()", "init()"], correctAnswer: "run()" },
  { id: 'jav17', domain: 'java', topic: 'Threads', text: "Which state does a thread enter when wait() is called?", options: ["Waiting", "Running", "Dead", "Blocked"], correctAnswer: "Waiting" },
  { id: 'jav18', domain: 'java', topic: 'Threads', text: "Which of these methods can be used to wake up a single thread waiting on an object's monitor?", options: ["notify()", "notifyAll()", "wake()", "resume()"], correctAnswer: "notify()" },
  { id: 'jav19', domain: 'java', topic: 'Threads', text: "What does the join() method do in Java threads?", options: ["Pauses the thread execution indefinitely", "Causes one thread to wait until another thread terminates", "Merges two threads into one", "Interrupts the thread"], correctAnswer: "Causes one thread to wait until another thread terminates" },
  { id: 'jav20', domain: 'java', topic: 'Threads', text: "A thread becomes dead when?", options: ["Its run method terminates", "Its sleep method is called", "It is waiting", "Start method is called twice"], correctAnswer: "Its run method terminates" }
];
