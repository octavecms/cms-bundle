<?php

namespace Octave\CMSBundle\Form\Type;

use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Octave\CMSBundle\Entity\Content;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class SimpleTextContentType extends AbstractType
{
    /** @var $locales */
    private $locales;

    /**
     * SimpleTextContentType constructor.
     * @param $locales
     */
    public function __construct($locales)
    {
        $this->locales = $locales;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($options['templates']) {
            $builder->add('template', ChoiceType::class, [
                'choices' => $options['templates']
            ]);
        }

        $builder
            ->add('translations', TranslationsType::class, [
                'label' => false,
                'locales' => $options['locales'],
                'fields' => [
                    'text' => [
                        'field_type' => CKEditorType::class
                    ]
                ]
            ]);
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'locales' => $this->locales,
            'data_class' => Content::class,
            'templates' => false
        ));
    }
}