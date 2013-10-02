
var M = Person.Male, F = Person.Female;

M("Grandfather-1")
.marry( F("Grandmother-1") )
.child(
	M("Uncle-1")
	.marry( F("Aunt-1") )
	.child( F("Cousin-1") )
	.child( M("Cousin-2") ) )
.child(
	M("Father")
	.marry( mother = F("Mother") )
	.child( M("Brother") )
	.child( F("Sister") ) )

F("Grandmother-2")
.marry( M("Grandfather-2") )
.child( mother )
.child(
	F("Aunt-2")
	.marry( M("Uncle-2") )
	.child( F("Cousin-3") )
	.child( M("Cousin-4") ) )