# Ada FuzzballSlam v2 Interaction
### Ada Fuzzball Slam is a JS game using P5 and Matter
Actually, I overcomplicated the project. If I had more js skills, I could have done this type of programming. However, I am still learning the language and  I learned a lot in the process of  the game creation.

Also as the beginner in js I experienced very steep learning curve. Even simple examples did not work for me.
Browser support debugging is not as efficient as other editors for typed languages. So I had hard time to convert.

The aim of writing this game is   a practice of class creation , overall gaining some experience in javascript.
The correct writing of the algorithms should yet be tested properly. I included some flow charts I based on. These are just drawings, but still valid.

The main goal of the assignment was creation of the game together with a partner. This unfortunately I failed all the way. It did not work even though we tried.
What exactly went wrong... main reason it was lack of experience. None of us did any programming project with another software developer. Lack of "know how " .

We used replit together . But It was only for chatting and observing .

We split our work . I created classes where inheritance was used. I tried to integrate our code and after some
more refactoring completely different game appeared.

The game has three rounds. The aim is to cause collision between units of attack and crates. Longer such collision lasts more points the players gets. If there is a collision there is an indication of it (a crater changes to red color). Each round the player gets a random weapon.

classes
1 Game

2 Weapon
3 DroppingBombs
4 MachineGun
5 Grenade
6 UnitOfAttack

For creation of these weapons is responsible class 2. It is a base class for classes 2,3,4. The child classes override  a method of abstract class . Doing so they introduce a different behavior of UnitsOfAttack.  The  abstract class hold an array of UnitOfAttack objects. 


When player launches a ball he launches one of three kinds of weapon.
They have different times of activation (class 5 activates a grenade after 550 milliseconds from launching a ball for example), different size, (they have also different strength of attack which is implemented partially ).

class 1 is just a wrapper around class 2. It simplifies the management of the child classes.

The units of attack are only spawn for a limited time (  randomise). Once all the these units of attack are removed from the world next turn begins.





