// AUTO-GENERATED — do not edit manually. Run "node scripts/generate-func-strings.cjs".

export const funcEntries: { name: string; func: string }[] = [
  { name: 'coalesce', func: `function($value, $default) {(
	$not($exists($value))
		? $default
		: $value;
)}
` },
  { name: 'dummyMCDateOpenAPI', func: `function() {(
	"0000-00-00";
)}
` },
  { name: 'dummyMCTimestampJSON', func: `function() {(
	"0000-00-00T00:00:00.000000";
)}
` },
  { name: 'dummyMCTimestampOpenAPI', func: `function() {(
	"0000-00-00T00:00:00.000000+00:00";
)}
` },
  { name: 'transformZonedTimestampToMCTimestampJSON', func: `function($value, $default) {  
    ($exists($value) and $value != null)  
        ? $fromMillisZoned($toMillis($value), "[Y0001]-[M01]-[D01]-[H01].[m01].[s01].[f000]000", "Europe/Brussels")  
        : ($default ? $dummyMCTimestampJSON() : null)  
}  ` },
  { name: 'transformZonedTimestampToMCTimestampOpenAPI', func: `function($value, $default) {  
    ($exists($value) and $value != null)  
        ? $fromMillisZoned($toMillis($value),  "[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01].[f000]000[Z]", "Europe/Brussels")  
        : ($default ? $dummyMCTimestampOpenAPI() : null)  
}  ` }
];
