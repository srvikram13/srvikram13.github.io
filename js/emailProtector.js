var decryption_cache = new Array();

function decrypt_string(crypted_string,n,decryption_key,just_email_address) {
	var cache_index = "'"+crypted_string+","+just_email_address+"'";

	if(decryption_cache[cache_index])					// If this string has already been decrypted, just
		return decryption_cache[cache_index];				// return the cached version.

	if(addresses[crypted_string])						// Is crypted_string an index into the addresses array
		var crypted_string = addresses[crypted_string];			// or an actual string of numbers?

	if(!crypted_string.length)						// Make sure the string is actually a string
		return "Error, not a valid index.";

	if(n == 0 || decryption_key == 0) {					// If the decryption key and n are not passed to the
		var numbers = crypted_string.split(' ');			// function, assume they are stored as the first two
		n = numbers[0];	decryption_key = numbers[1];			// numbers in crypted string.
		numbers[0] = ""; numbers[1] = "";				// Remove them from the crypted string and continue
		crypted_string = numbers.join(" ").substr(2);
	}

	var decrypted_string = '';
	var crypted_characters = crypted_string.split(' ');

	for(var i in crypted_characters) {
		var current_character = crypted_characters[i];
		var decrypted_character = exponentialModulo(current_character,n,decryption_key);
		if(just_email_address && i < 7)				// Skip 'mailto:' part
			continue;
		if(just_email_address && decrypted_character == 63)	// Stop at '?subject=....'
			break;
		decrypted_string += String.fromCharCode(decrypted_character);
	}
		decryption_cache[cache_index] = decrypted_string;			// Cache this string for any future calls

	return decrypted_string;
}

function decryptAndEmail(crypted_string,n,decryption_key) {
	if(!n || !decryption_key) { n = 0; decryption_key = 0; }
	if(!crypted_string) crypted_string = 0;

	var decrypted_string = decrypt_string(crypted_string,n,decryption_key,false);
	parent.location = decrypted_string;
}

function decrypt_and_echo(crypted_string,n,decryption_key) {
	if(!n || !decryption_key) { n = 0; decryption_key = 0; }
	if(!crypted_string) crypted_string = 0;

	var decrypted_string = decrypt_string(crypted_string,n,decryption_key,true);
	document.write(decrypted_string);
	return true;
}

// Finds base^exponent % y for large values of (base^exponent)
function exponentialModulo(base,exponent,y) {
	if (y % 2 == 0) {
		answer = 1;
		for(var i = 1; i <= y/2; i++) {
			temp = (base*base) % exponent;
			answer = (temp*answer) % exponent;
		}
	} else {
		answer = base;
		for(var i = 1; i <= y/2; i++) {
			temp = (base*base) % exponent;
			answer = (temp*answer) % exponent;
		}
	}
	return answer;
}

if(!addresses) var addresses = new Array();
addresses.push("3379 3373 1744 2837 365 1852 2478 1652 1255 641 135 3125 365 1073 135 2837 1744 1931 2560 500 1539 1744 2837 365 1852 1790 2610 1652 1744 63 641 2297 563 456 2172 2610 2478 867 1351 2172 2645 1255 3080 365 2478 2172");  // [0] srvikram13 - at - gmail.com
