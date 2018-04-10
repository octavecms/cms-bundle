<?php

namespace Octave\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType as BaseCollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Octave\CMSBundle\Form\DataTransformer\JSONDataTransformer;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class CollectionType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->addModelTransformer(new JSONDataTransformer());
        $builder->addEventListener(FormEvents::PRE_SET_DATA, function(FormEvent $event) {

            $data = $event->getData();

            if (is_string($data)) {
                $data = json_decode($data, true);
            }

            $event->setData($data);
        }, 40);
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return BaseCollectionType::class;
    }

    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'octave_collection';
    }
}