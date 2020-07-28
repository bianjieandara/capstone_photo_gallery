class Thing < ActiveRecord::Base
  include Protectable
  validates :name, :presence=>true

  has_many :thing_images, inverse_of: :thing, dependent: :destroy
  belongs_to :tag

  scope :not_linked, ->(image) { where.not(:id=>ThingImage.select(:thing_id)
                                                          .where(:image=>image)) }
   
  scope :with_tag, ->(id) { where(tag_id: id) }

  def images
  	thing_images.collect { |ti| ti.image }
  end
  
end
