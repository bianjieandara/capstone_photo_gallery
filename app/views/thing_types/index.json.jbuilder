json.array!(@thing_types) do |ti|
  json.extract! ti, :id, :thing_id, :type_id, :creator_id, :created_at, :updated_at
  json.thing_name ti.thing_name        if ti.respond_to?(:thing_name)
  json.type_name ti.type_name  if ti.respond_to?(:type_name)
end
