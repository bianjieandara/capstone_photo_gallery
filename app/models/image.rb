class Image < ActiveRecord::Base
  include Protectable
  attr_accessor :image_content

  has_many :thing_images, inverse_of: :image, dependent: :destroy
  has_many :things, through: :thing_images

  composed_of :position,
              class_name:"Point",
              allow_nil: true,
              mapping: [%w(lng lng), %w(lat lat)]

  scope :exclude, ->(id) { where.not(:id=>id) }                       
  scope :within_exclude, ->(origin, limit=nil, exclude=nil ) {
    scope=Image.all
    scope=scope.within(limit,:origin=>origin)   if limit && origin 
    scope=scope.exclude(exclude)                if exclude   
    return scope
  }

  acts_as_mappable
  def to_lat_lng
    Geokit::LatLng.new(lat,lng)
  end

  def basename
    caption || "image-#{id}"
  end

  def self.with_distance(origin, scope)
    scope.select("-1 as distance")
         .each {|image| image.distance = image.distance_from(origin)}
  end    
end

Point.class_eval do
  def to_lat_lng
    Geokit::LatLng.new(*latlng)
  end
end
