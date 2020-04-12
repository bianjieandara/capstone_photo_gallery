# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
City.all.destroy_all
State.all.destroy_all

cities = ["Miami", "Baltimore", "Seattle", "Los Angeles","Orlando"]
states = ["Florida", "Maryland", "Georgia", "California","Arizona"]

cities.each {|city| City.create(name: "#{city}")}
states.each {|state| State.create(name: "#{state}")}
