#/usr/bin/env tclsh

package require http

proc unknown args {
  return \"[lindex $args 1]\"
}

proc lang arg {
  set result [list]

  foreach v [split $arg ,] {
    lappend result \"$v\"
  }

  return "\[[join $result ,]\]"
}

set ARGS [dict create _id [exec date --utc +%FT%TZ]]

foreach {key value} $argv {
  dict set ARGS [string trimleft $key -] $value
}

dict for {key value} $ARGS {
  lappend result "\"$key\":[$key $value]"
}

puts "\{[join $result ",\n"]\}"

set result [http::geturl "http://localhost:5984/work/[dict get $ARGS _id]" -method PUT -type application/json -query "\{[join $result ",\n"]\}"]
puts [http::status $result]
