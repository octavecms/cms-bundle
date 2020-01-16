<?php

namespace Octave\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaGalleryType extends AbstractType
{
    /** @var DataTransformerInterface */
    private $transformer;

    /** @var $locales */
    private $locales;

    /**
     * MediaGalleryType constructor.
     * @param DataTransformerInterface $transformer
     * @param $locales
     */
    public function __construct(DataTransformerInterface $transformer, $locales)
    {
        $this->transformer = $transformer;
        $this->locales = $locales;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->addModelTransformer($this->transformer);

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
    public function getBlockPrefix()
    {
        return 'media_gallery';
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return CollectionType::class;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'entry_type' => MediaGalleryItemType::class,
            'entry_options' => [
                'locales' => $this->locales
            ],
            'locales' => $this->locales,
            'allow_add' => true,
            'allow_delete' => true
        ]);
    }
}