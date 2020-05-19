class ThingTypesController < ApplicationController
  include ActionController::Helpers
  helper ThingsHelper
  wrap_parameters :thing_type, include: ["type_id", "thing_id"]
  before_action :get_thing, only: [:index, :update, :destroy]
  before_action :get_type, only: [:type_things]
  before_action :get_thing_type, only: [:update, :destroy]
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  after_action :verify_authorized


  def index
    authorize @thing, :get_types?
    @thing_types = @thing.thing_types.with_type_name
  end

  def type_things
    authorize @type, :get_things?
    @thing_types=@type.thing_types.with_name
    render :index 
  end

  def linkable_things
    authorize Thing, :get_type_linkables?
    type = Type.find(params[:type_id])
    @things=Thing.not_linked_types(type)
    @things=ThingPolicy::Scope.new(current_user,@things).user_roles2
    @things=ThingPolicy.merge(@things)
    render "things/index"
  end

  def create
    thing_type = ThingType.new(thing_type_create_params.merge({
                                  :type_id=>params[:type_id],
                                  :thing_id=>params[:thing_id],
                                  }))
    thing=Thing.where(id:thing_type.thing_id).first
    if !thing
      full_message_error "cannot find thing[#{params[:thing_id]}]", :bad_request
      skip_authorization
    elsif !Type.where(id:thing_type.type_id).exists?
      full_message_error "cannot find type[#{params[:type_id]}]", :bad_request
      skip_authorization
    else
      authorize thing, :add_type?
      thing_type.creator_id=current_user.id
      if thing_type.save
        head :no_content
      else
        render json: {errors:@thing_type.errors.messages}, status: :unprocessable_entity
      end
    end
  end

  def update
    authorize @thing, :update_type?
    if @thing_type.update(thing_type_update_params)
      head :no_content
    else
      render json: {errors:@thing_type.errors.messages}, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @thing, :remove_type?
    @thing_type.destroy
    head :no_content
  end

  private
    def get_thing
      @thing ||= Thing.find(params[:thing_id])
    end
    def get_type
      @type ||= Type.find(params[:type_id])
    end
    def get_thing_type
      @thing_type ||= ThingType.find(params[:id])
    end

    def thing_type_create_params
      params.require(:thing_type).tap {|p|
          p.require(:type_id)    if !params[:type_id]
          p.require(:thing_id)    if !params[:thing_id]
        }.permit(:type_id, :thing_id)
    end
    def thing_type_update_params
      params.require(:thing_type).permit(:type_id, :thing_id)
    end
end